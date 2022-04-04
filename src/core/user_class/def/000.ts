import { ObjectId } from 'mongodb';
import { SchemaProperty } from '../../versioning/src/types';
import { config as configuration } from '../../..';

export namespace UserSchema {
    export interface User {
        _id: ObjectId;
    
        username: string;
    
        authentication: {
            lastLogin: Date;
            lastLoginIP: string;
            loginAttempts: number;
            threatLevel: number;
        };
        
        registration: {
            date: Date;
            ip: string;
        }
    
        version: [number, number, number];
    }

    export const config = {
        _id: new SchemaProperty({
            acceptedTypes: ['objectId'],
            required: true,
            defaultValue: new ObjectId(),
            description: 'The unique id of the user',
            accessGroup: ['everyone'],
            modifyGroup: ['self'],
        }),

        username: new SchemaProperty({
            acceptedTypes: ['string'],
            required: true,
            defaultValue: '',
            description: 'The username of the user',
            accessGroup: ['everyone'],
            modifyGroup: ['self'],
            toEdit: (value, newValue) => {
                // See if the user can change their username
                if (value.key('changeUsername') !== true) return false;
                
                // Get the username regex from the config
                const usernameRegex = new RegExp(configuration.config.regex.username);

                // Check if the username is valid
                if (!usernameRegex.test(newValue)) return false;

                // Else return true, allowing the user to change their username
                return true;
            }
        }),

        sanctions: {
            changeUsername: new SchemaProperty({
                key: 'changeUsername',
                acceptedTypes: ['boolean'],
                required: true,
                defaultValue: false,
                description: 'This sets whether or not the user can change their username',
                accessGroup: ['self'],
            }),
        },

        visability: {
            loginVisibility: new SchemaProperty({
                key: 'loginVisibility',
                acceptedTypes: ['boolean'],
                required: true,
                defaultValue: true,
                description: 'The user can change this value, if true, other users can see the user\'s last login',
                accessGroup: ['everyone'],
                modifyGroup: ['self'],
            }),

            registrationVisibility: new SchemaProperty({
                key: 'registrationVisibility',
                acceptedTypes: ['boolean'],
                required: true,
                defaultValue: true,
                description: 'The user can change this value, if true, other users can see the user\'s registration date',
                accessGroup: ['everyone'],
                modifyGroup: ['self'],
            }),
        },

        authentication: {
            lastLogin: new SchemaProperty({
                acceptedTypes: ['date'],
                required: true,
                defaultValue: new Date(),
                description: 'This is the last time the user logged in',
                accessGroup: ['everyone'],
                toView: (value) => {
                    const visability = new value.key('loginVisibility');

                    if(visability === true) return true;
                    else return false;
                }
            }),
            
            lastLoginIP: new SchemaProperty({
                acceptedTypes: ['string'],
                required: true,
                defaultValue: '',
                description: 'The IP address of the last login',
                accessGroup: ['self'],
            }),

            loginAttempts: new SchemaProperty({
                acceptedTypes: ['number'],
                required: true,
                defaultValue: 0,
                description: 'Amount of failed login attempts',
                accessGroup: ['self'],
            }),

            threatLevel: new SchemaProperty({
                acceptedTypes: ['number'],
                required: true,
                defaultValue: 0,
                description: 'The threat level of the user',
            }),
        },

        registration: {
            date: new SchemaProperty({
                acceptedTypes: ['date'],
                required: true,
                defaultValue: new Date(),
                description: 'This is the date of registration',
                accessGroup: ['everyone'],
                toView: (value) => {
                    const visability = new value.key('registrationVisibility');

                    if(visability === true) return true;
                    else return false;
                }
            }),

            ip: new SchemaProperty({
                acceptedTypes: ['array<string>'],
                required: true,
                defaultValue: '',
                description: 'This is the IP of registration',
            })
        },

        version: new SchemaProperty({
            acceptedTypes: [
                ['number', 'number', 'number'],
                ['number', 'boolean', 'number'],
            ],
            required: true,
            defaultValue: [0, 0, 0],
            description: 'The version of the schema',
        }),
    }
}