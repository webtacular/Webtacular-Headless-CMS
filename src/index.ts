import Fastify from "fastify";
export const app = Fastify({
    logger: false,
});

import { mongoDB } from './core/db_service';
import { addons } from './core/addon_service';
import { user } from './core/user_service';
import { lockGraphQL } from './api/src/graphql';
import { scanAddonDir } from "./core/addon_service/src/scan";
import { ObjectId } from "mongodb";
import { SecurityOptionsInterface } from "./core/interfaces";
import { discord } from "./core/oauth_service";
import { authorization } from "./core/authorization_service";
import role_service from "./core/role_service";

export const settings = require('../settings.json');

const port:number = 443;

app.register(require('fastify-cookie'), {});

// Global variables set by the settings file
declare global {
    var __GLOBAL_ROLE_IDS__:{[key:string]:ObjectId};
    var __MONGO_DB__: string;
    var __COLLECTIONS__:any;
    var __SECURITY_OPTIONS__:SecurityOptionsInterface;
}
    
(async() => {
    await mongoDB.addDB(settings.api.mongodb.dev_uri, settings.api.mongodb.dev_db, settings.api.mongodb.dev_collection);
    global.__MONGO_DB__ = settings.api.mongodb.dev_db;

    global.__COLLECTIONS__ = { //TODO: Add specific interfaces for these
        ip: 'ip',
        config: 'config',
        user: 'users',
        token: 'tokens',
        role: 'roles',
        content: 'content',
        oauth: 'oauth',
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
    //await precedence.validateDB();

    //load the gql schemas
    user.gql();
    //role.gql();
    addons.gql();
    discord.gql();
    authorization.gql();

    // role_service.create({
    //     name: 'admin',
    //     permissions: [
    //         {
    //             _id: new ObjectId(),
    //             value: 0,
    //         }
    //     ],
    //     precedence: 5
    // }).catch(console.error).then(console.log);    
    
    //Let the plugins do their thing
    addons.start(app);

    //load GQL
    lockGraphQL(app, true, '/gql'); 
    
    // await sendMail({
    //     from: 'greg',
    //     to: 'greg',
    //     subject: 'test',
    //     body: 'test',
    // }).then(console.log).catch(console.error);

    app.listen(port, (error:any) => {
        if (error) console.error(error);
        else console.log(`Server started: http://127.0.0.1:${port}`);
    });
})();

//Cataches all other routes and sends a 404 error
app.all('/*', (req:any, res:any) => {});