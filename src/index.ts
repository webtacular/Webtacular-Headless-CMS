//
// Please ignore how messy this file is. Its used as a testing ground for the core of GCHMS.
// Once the core is stable, this file will be refactored.
//
import Fastify from "fastify";
export const app = Fastify({
    logger: false,
});

import init, { CollectionInterface, ConfigInterface } from "./init";

import { mongoDB } from './core/db_service';
import { addons } from './core/addon_service';
import { user } from './core/user_service';
import { lockGraphQL } from './api/src/graphql';
import { scanAddonDir } from "./core/addon_service/src/scan";
import { discord } from "./core/oauth_service";
import { authorization } from "./core/authorization_service";
import role_service from "./core/role_service";
import { ObjectId } from "mongodb";

export const settings = require('../settings.json');

app.register(require('fastify-cookie'), {});

// Global variables set by the settings file
declare global {
    var __MONGO_DB__: string;
    var __COLLECTIONS__:CollectionInterface;
    var __CONFIG__:ConfigInterface;
}
    
(async() => {
    // Initialize MongoDB, This will be moved to a separate process later
    await mongoDB.addDB(settings.api.mongodb.dev_uri, settings.api.mongodb.dev_db, settings.api.mongodb.dev_collection);
    global.__MONGO_DB__ = settings.api.mongodb.dev_db;

    // Initialize the configuration
    global.__CONFIG__ = await init();

    // Check what development environment we are in
    const env = global.__CONFIG__.server.dev;

    // Initialize the correct collections
    switch(env) {
        case true:
            global.__COLLECTIONS__ = global.__CONFIG__.collections.dev;
            break;

        case false:
            global.__COLLECTIONS__ = global.__CONFIG__.collections.prod;        
            break;
    }

    //scan and load plugins
    scanAddonDir(__dirname + '/addons');

    //load the gql schemas
    user.gql();
    addons.gql();
    discord.gql();
    authorization.gql();   
    
    //Let the plugins do their thing
    addons.start(app);

    //load GQL
    lockGraphQL(app, true, '/gql'); 


    // editPrecedence({
    //     _id: new ObjectId('621e142348fc199d51e3fea6'),
    //     precedence: 3,
    // }).then(console.log).catch(console.error);

    // role_service.create({
    //     name: 'test_role10',
    //     permissions: [
    //         {
    //             _id: new ObjectId('621df2f4bd77df09f276ca1c'),
    //             value: 0,       
    //         }
    //     ]
    // }).catch(console.error).then(console.log);

    role_service.get([new ObjectId('621e142348fc199d51e3fea6'), new ObjectId("621e142348fc199d51e3fea6")]).catch(console.error).then(console.log);  



    // Finaly, Start the server
    app.listen(__CONFIG__.server.port, (error:any) => {
        if (error) console.error(error);
        else console.log(`Server started: http://127.0.0.1:${__CONFIG__.server.port}`);
    });
})();

// All requests will be returned with a 404 error, as this is a headless server
app.all('/*', (req:any, res:any) => {
    res.send(404);
    res.end();
});