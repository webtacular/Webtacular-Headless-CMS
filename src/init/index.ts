import yaml from 'yaml'
import fs from 'fs'
import { ObjectId } from 'mongodb';
import logger from '../core/logger';

export interface CollectionInterface {
    ip: string;
    config: string;     
    user: string;   
    token: string;  
    role: string;
    content: string;
    oauth: string;  
}

export interface GlobalsInterface {
    role: ObjectId;
}

export interface ConfigInterface {
    server: {
        port: number,
        log: boolean,   
        event_listeners: number,
        dev: boolean    
    },
    security: {
        token: {
            salt_rounds: number,
            expiration: number, 
            cache: boolean,     
            cache_ttl: number,
            length: number,
        },
        password: {
            salt_rounds: number,
            max_attempts: number,
            max_history: number,
        }
    },
    collections: {
        prod: CollectionInterface,
        dev: CollectionInterface
    },
    global_objects: {
        prod: GlobalsInterface,
        dev: GlobalsInterface
    }
}

// This is the default settings file that is used if the settings file is not found
const defaultConfig = ():ConfigInterface => {
    return {
        server: {
            port: 443,
            log: false,
            event_listeners: 15,
            dev: true,
        },
        security: {
            token: {
                salt_rounds: 12,
                expiration: 2678400, // 1 month in seconds
                cache_ttl: 600 * 6, // 60 minutes in seconds
                cache: true,
                length: 20,
            },
            password: {
                salt_rounds: 12,
                max_attempts: 5,
                max_history: 15,
            }
        },
        collections: {
            prod: {
                ip: 'ip',
                config: 'config',
                user: 'users',
                token: 'tokens',
                role: 'roles',
                content: 'content',
                oauth: 'oauth'
            },
            dev: {
                ip: 'ip',
                config: 'config',
                user: 'users',
                token: 'tokens',
                role: 'roles',
                content: 'content',
                oauth: 'oauth'
            }
        },
        global_objects: {
            prod: {
                role: new ObjectId()
            },
            dev: {
                role: new ObjectId()
            }
        }
    }
}

// Global Role Object
import gro from './src/globalRoleObject';
import { exit } from 'process';

export default async() => {
    logger.log({ message: 'Loading configuration...' });

    // Check if the configuration file exists
    if(fs.existsSync('./config.yml') !== true) {
        logger.log({ message: 'Configuration file not found, creating one...' });

        // Create the configuration file if none is found
        fs.writeFileSync('./config.yml', yaml.stringify(defaultConfig()));

        logger.log({ message: 'Configuration file created!' });
    }

    // Attempt to load in the yaml configuration file.
    const config = yaml.parse(fs.readFileSync('./config.yml', 'utf8')) as ConfigInterface;
    logger.log({ message: 'Configuration loaded!' });

    const env: boolean = config.server.dev;

    // -----------------------------------//
    // Attempt to load the global objects //
    // -----------------------------------//

    let global_objects = env ? config.global_objects.dev : config.global_objects.prod;

    // ----[ Global Role Object ]----// 
    logger.log({ message: 'Verifying the Global Role Object', data: global_objects.role });
    await gro(config, env).catch(err => {
        logger.log({ message: 'Global Role Object failed to load', data: err });
        exit(1);
    });
    logger.log({ message: 'Global Role Object Verified!' });

    // At the end, return the configuration
    return config;
}