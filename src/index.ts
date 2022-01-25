export const express:any = require('express'),
    app:any = express(),
    settings = require('../settings.json'),
    cookieParser = require('cookie-parser');

import { httpErrorHandler, localMiddleware, locals } from './core/response_handler';
import { mongoDB } from './core/db_service';
import { lockGraphSQL } from './api/graphql';
import './api/graphql';

const port:number = 3000;

//Express setting that disables the X-Powered-By header
app.disable("x-powered-by");

//Exppres middleware that checks if the request contains a language header
app.use(localMiddleware(locals.supported_languages));

//Express middleware that parses cookies
app.use(cookieParser());

// Global variables set by the settings file
declare global {
    var __DEF_MONGO_DB__: string;
    var __DEF_REDIS_DB__: string;

    var __AVAILABLE_LANGUAGES__: string[];
    var __SALT_ROUNDS__: number;

    var __AUTH_COLLECTIONS__:any;
    var __SECURITY_OPTIONS__:any;
}

lockGraphSQL();
    
(async() => {
    switch(settings.api.production) {
        case true:
            await mongoDB.addDB(settings.api.mongodb.prod_uri, settings.api.mongodb.prod_db, settings.api.mongodb.prod_collection);
            global.__DEF_MONGO_DB__ = settings.api.mongodb.dev_db;
            break;

        case false:
            process.stdout.write('!!! Using development databases !!!\n');

            await mongoDB.addDB(settings.api.mongodb.dev_uri, settings.api.mongodb.dev_db, settings.api.mongodb.dev_collection);
            global.__DEF_MONGO_DB__ = settings.api.mongodb.dev_db;
            break;
    }

    global.__AUTH_COLLECTIONS__ = { //TODO: Add specific interfaces for these
        ip_collection: 'ip',
        user_collection: 'users',
        token_collection: 'tokens',
        blog_collection: 'blogs',
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

    app.listen(port, (error:any) => {
        if (error) console.error(error);
        else console.log(`Server listening on port: ${port}`);
    });
})();

//Cataches all other routes and sends a 404 error
app.all('/*', (req:any, res:any) =>
    httpErrorHandler(404, res));