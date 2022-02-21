import Fastify from "fastify";
export const app = Fastify({
    logger: false,
});

import { mongoDB } from './core/db_service';
import { addons } from './core/addon_service';
import { user } from './core/user_service';
import { lockGraphQL } from './api/src/graphql';
import { scanAddonDir } from "./core/addon_service/src/scan";
import { precedence, role } from "./core/role_service";
import { ObjectId } from "mongodb";
import {DiscordBearerInterface, SecurityOptionsInterface} from "./core/interfaces";
import { discord } from "./core/oauth_service";

export const settings = require('../settings.json');

const port:number = 3000;

app.register(require('fastify-cookie'), {});

// Global variables set by the settings file
declare global {
    var __GLOBAL_ROLE_IDS__:{[key:string]:ObjectId};
    var __DEF_MONGO_DB__: string;
    var __AUTH_COLLECTIONS__:any;
    var __SECURITY_OPTIONS__:SecurityOptionsInterface;
}
    
(async() => {
    await mongoDB.addDB(settings.api.mongodb.dev_uri, settings.api.mongodb.dev_db, settings.api.mongodb.dev_collection);
    global.__DEF_MONGO_DB__ = settings.api.mongodb.dev_db;

    global.__AUTH_COLLECTIONS__ = { //TODO: Add specific interfaces for these
        ip_collection: 'ip',
        user_collection: 'users',
        token_collection: 'tokens',
        role_collection: 'roles',
        content_collection: 'content',
    }

    global.__SECURITY_OPTIONS__ = { 
        ip: {
            max_per_ip: 15,
            timeout: 2678400,
        },
    
        security: {
            password_salt_rounds: 12,
            token_salt_rounds: 12,
            token_expiration: 2678400, // 1 month in seconds
            token_cache_ttl: 600 * 6, // 60 minutes in seconds
            token_cache: true,
            token_length: 20,
            max_attempts: 5,
            max_login_history: 15,
        }
    }

    global.__GLOBAL_ROLE_IDS__ = {
        'admin': new ObjectId('61f1cd2524b5e8bb098a1f52'),
    }

    require('events').EventEmitter.defaultMaxListeners = 15;

    //scan and load plugins
    scanAddonDir(__dirname + '/addons');

    //load the role cache and db
    await precedence.validateDB();

    //load the gql schemas
    user.gql();
    role.gql();
    addons.gql();
    discord.gql();

    //Let the plugins do their thing
    addons.start(app);

    //load GQL
    lockGraphQL(app, true, '/gql'); 
    
    // await discord.authorize('wa5nFNQJVQIgaX8AY0fSr08p42hI7K')
    // .then(data => console.log(data))
    // .catch(err => console.log(err))

    // let data = await discord.refresh('0bx72YBtUViOxDBBgBSr5flXBTzn4D').catch(err => console.log(err))
    
    // data = data as DiscordBearerInterface; 
    // console.log(data);

    // await discord.get('identify', data).then(data => console.log(data)).catch(err => console.log(err));
    // await discord.get('identify', data).then(data => console.log(data)).catch(err => console.log(err));

    app.listen(port, (error:any) => {
        if (error) console.error(error);
        else console.log(`Server listening on port: ${port}`);
    });
})();

//Cataches all other routes and sends a 404 error
app.all('/*', (req:any, res:any) => {});