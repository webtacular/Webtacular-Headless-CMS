const express:any = require('express'),
    { json } = require('body-parser'),
    app:any = express(),
    settings = require('../settings.json'),
    cookieParser = require('cookie-parser');

import { httpErrorHandler, localMiddleware, locals } from './internal/response_handler';
import { default as route, strictRest } from './internal/route_service';

const port:number = 3000,
    maxBodySize:number = 250;

//Express middleware that only allows POST, PUT, DELETE and GET requests
app.use(strictRest);

//Express middleware that parses the body of the request
app.use('/', json({ limit: maxBodySize }));

//Express setting that disables the X-Powered-By header
app.disable("x-powered-by");

//Exppres middleware that checks if the request contains a language header
app.use(localMiddleware(locals.supported_languages));

//Express middleware that parses cookies
app.use(cookieParser());

//Express middleware that handles json body parsing errors
app.use(function (error:any, req:any, res:any, next:any){
    return httpErrorHandler(error.statusCode, res, `${error.message}${(() => {
        if(error.statusCode === 413) return `, max body size: ${maxBodySize} bytes`;
        else return '';
    })()}`);
});

//  .oooooo..o     .                          .   
// d8P'    `Y8   .o8                        .o8   
// Y88bo.      .o888oo  .oooo.   oooo d8b .o888oo 
//  `"Y8888o.    888   `P  )88b  `888""8P   888   
//      `"Y88b   888    .oP"888   888       888   
// oo     .d8P   888 . d8(  888   888       888 . 
// 8""88888P'    "888" `Y888""8o d888b      "888" 

import { addMongoDB, addRedisDB } from './internal/db_service';
import { AuthCollection } from './internal/interfaces';

// Global variables set by the settings file
declare global {
    var __DEF_MONGO_DB__: string;
    var __DEF_REDIS_DB__: string;

    var __AVAILABLE_LANGUAGES__: string[];
    var __SALT_ROUNDS__: number;

    var __AUTH_COLLECTIONS__:any;
    var __SECURITY_OPTIONS__:any;
}

(async() => {
    switch(settings.api.production) {
        case true:
            await addMongoDB(settings.api.mongodb.prod_uri, settings.api.mongodb.prod_db, settings.api.mongodb.prod_collection);
            global.__DEF_MONGO_DB__ = settings.api.mongodb.dev_db;
            break;

        case false:
            process.stdout.write('!!! Using development databases !!!\n');

            await addMongoDB(settings.api.mongodb.dev_uri, settings.api.mongodb.dev_db, settings.api.mongodb.dev_collection);
            global.__DEF_MONGO_DB__ = settings.api.mongodb.dev_db;

            await addRedisDB(settings.api.redis.dev_uri, settings.api.redis.dev_name);
            global.__DEF_REDIS_DB__ = settings.api.redis.dev_name;
            break;
    }

    global.__SALT_ROUNDS__ = settings.api.security.salt_rounds;

    global.__AUTH_COLLECTIONS__ = { //TODO: Add specific interfaces for these
        ip_collection: 'ip',
        user_collection: 'users',
        token_collection: 'tokens'
    }

    global.__SECURITY_OPTIONS__ = { //TODO: Add specific interfaces for these
        accounts_per_ip: 5,
        new_account_timeout: 0,
        max_login_attempts: 5,
        max_login_history: 15,
        token_lenght: 20,
        token_expiration: 2678400, // 31 days in unix time
    }

    app.listen(port, (error:any) => {
        if (error) console.error(error);
        else console.log(`Server listening on port: ${port}`);
    });
})();


// ooooooooo.
// `888   `Y88.
//  888   .d88'  .ooooo.   .oooo.o  .ooooo.  oooo  oooo  oooo d8b  .ooooo.   .ooooo.   .oooo.o 
//  888ooo88P'  d88' `88b d88(  "8 d88' `88b `888  `888  `888""8P d88' `"Y8 d88' `88b d88(  "8 
//  888`88b.    888ooo888 `"Y88b.  888   888  888   888   888     888       888ooo888 `"Y88b.  
//  888  `88b.  888    .o o.  )88b 888   888  888   888   888     888   .o8 888    .o o.  )88b 
// o888o  o888o `Y8bod8P' 8""888P' `Y8bod8P'  `V88V"V8P' d888b    `Y8bod8P' `Y8bod8P' 8""888P' 

//Users resource

route(`${__dirname}/v1/users`,'v1/users', app, { 
    GET: [':id'],
    PUT: [':id'],
    DELETE: [':id']
});

route(`${__dirname}/v1/session`, 'v1/session', app, { 
    GET: [':id'],
    DELETE: [':token']
});

route(`${__dirname}/v1/blog`, 'v1/blog', app, { 
    GET: [':id'],
    PUT: [':id'],
    DELETE: [':id']
});

//Cataches all other routes and sends a 404 error
app.all('/*', (req:any, res:any) =>
    httpErrorHandler(404, res)
);