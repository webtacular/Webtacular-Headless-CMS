import Fastify from "fastify";
export const app = Fastify({
    logger: false,
});

import { mongoDB } from './core/db_service';
import { addons } from './core/addon_service';
import { user } from './core/user_service';
import { lockGraphQL } from './api/src/graphql';
import { scanAddonDir } from "./core/addon_service/src/scan";
import { perm } from "./core/role_service";
import {ObjectId} from "mongodb";

const settings = require('../settings.json');

const port:number = 3000;

app.register(require('fastify-cookie'), {});

// Global variables set by the settings file
declare global {
    var __GLOBAL_ROLE_IDS__:{[key:string]:ObjectId};
    var __DEF_MONGO_DB__: string;
    var __AUTH_COLLECTIONS__:any;
    var __SECURITY_OPTIONS__:any;
}
    
(async() => {
    await mongoDB.addDB(settings.api.mongodb.dev_uri, settings.api.mongodb.dev_db, settings.api.mongodb.dev_collection);
    global.__DEF_MONGO_DB__ = settings.api.mongodb.dev_db;

    global.__AUTH_COLLECTIONS__ = { //TODO: Add specific interfaces for these
        ip_collection: 'ip',
        user_collection: 'users',
        token_collection: 'tokens',
        role_collection: 'roles',
    }

    global.__SECURITY_OPTIONS__ = { //TODO: Add specific interfaces for these
        accounts_per_ip: 5,
        new_account_timeout: 0,
        max_login_attempts: 5,
        max_login_history: 15,
        password_salt_rounds: 12,

        //Tokens
        token_salt_rounds: 10,
        token_lenght: 20,
        token_expiration: 2678400, // 31 days in seconds
        token_cache_expiration: 600 * 6, // 60 min in seconds
        cache_tokens: true,
    }

    global.__GLOBAL_ROLE_IDS__ = {
        'admin': new ObjectId('61f1cd2524b5e8bb098a1f52'),
    }

    require('events').EventEmitter.defaultMaxListeners = 15;

    //scan and load plugins
    scanAddonDir(__dirname + '/addons');

    //load the gql schemas
    user.gql();
    perm.gql();
    addons.gql();

    //Let the plugins do their thing
    addons.start(app);

    //load GQL
    lockGraphQL(app, true, '/gql'); //TODO: for now, keep this at /gql, it should be root, and on a subdomain eg. https://gql.domain.com/

    app.listen(port, (error:any) => {
        if (error) console.error(error);
        else console.log(`Server listening on port: ${port}`);
    });

    //let msg = await user.get([new ObjectId('61e9aa2f3e6e687d3b0ba58c'), new ObjectId('61e9a16ac82a7ded5811144e'), new ObjectId('61e9a16ac82a7ded5811144e')]);
    //let msg = await user_role.add(new ObjectId('61e9aa2f3e6e687d3b0ba58c'), new ObjectId('61f1ccc79623d445bd2f677f'), true);
    //let msg = await user_role.remove(new ObjectId('61e9aa2f3e6e687d3b0ba58c'), new ObjectId('61f1cd2524b5e8bb098a1f52'), true);
    //console.log(msg);
    //let msg = await user_role.remove(new ObjectId('61e9a16ac82a7ded5811144e'), new ObjectId('61f1cd2524b5e8bb098a1f52'), true);
    //TODO: Has dosent work.
    //console.log(await user_role.has(new ObjectId('61e9a16ac82a7ded5811144e'), [new ObjectId('61f1cd2524b5e8bb098a1f52')], true));
})();

//Cataches all other routes and sends a 404 error
app.all('/*', (req:any, res:any) => {});