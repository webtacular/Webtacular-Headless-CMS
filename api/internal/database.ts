import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import { httpErrorHandler, locals, returnLocal } from '../public/response_handler';
import { createClient } from 'redis';

//  __  __                         _____  ____  
// |  \/  |                       |  __ \|  _ \ 
// | \  / | ___  _ __   __ _  ___ | |  | | |_) |
// | |\/| |/ _ \| '_ \ / _` |/ _ \| |  | |  _ < 
// | |  | | (_) | | | | (_| | (_) | |__| | |_) |
// |_|  |_|\___/|_| |_|\__, |\___/|_____/|____/ 
//                      __/ |                   
//                     |___/                    

// Variable that stores our MongoDB Databases.
export let mongo_databases:{ [key: string]: { cs:string, collection:string, client:MongoClient } } = {};

/**
 * This function is used to connect to a MongoDB database.
 * 
 * @param cs string - the Connection string of your MongoDB database
 * @param db string - the name of the database to connect to
 * @param collection string - the name of the collection to use, can be changed later
 * 
 * @returns Promise<MongoClient> - a promise that resolves to a MongoClient
**/
export async function addMongoDB(cs:string, db:string, collection:string):Promise<MongoClient> {
    const client = new MongoClient(cs, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    } as MongoClientOptions);

    // Attempt to connect to the MongoDB server, if it fails, throw an error
    await client.connect().catch((err) => { throw err; });

    // Add the database to the list of databases
    mongo_databases[db] = {
        cs,
        collection,
        client
    };

    // Return the client
    return client;
}

/**
 * This function is used to get a MongoDB collection, if the collection does not exist, it will be created.
 * 
 * @param db string - the name of the database to get the collection from
 * @param collection string - the name of the collection to get, optional, uses the default collection if not provided
 * @param res any - the response object, optional
 * 
 * @returns Collection - the collection object
**/
export function getMongoDBclient(db:string, collection?:string, res?:any):Collection<{[key: string | number]: any}> {
    
    // If the database doesn't exist, throw an error
    if(!mongo_databases[db]) {
        // If the response object is defined, send an error to the client
        if(res) httpErrorHandler(500, res, returnLocal(locals.KEYS.DATABASE_UNKNOWN_ERROR));

        // Otherwise, throw an error
        else throw new Error(`MongoDB database ${db} not found`);
    }

    // If a collection is not provided, use the default collection
    if(!collection) collection = mongo_databases[db].collection;

    // Return the collection
    return (mongo_databases[db].client.db(db).collection<{[key: string | number]: any}>(collection));
}

//  _____          _ _     _____  ____  
// |  __ \        | (_)   |  __ \|  _ \ 
// | |__) |___  __| |_ ___| |  | | |_) |
// |  _  // _ \/ _` | / __| |  | |  _ < 
// | | \ \  __/ (_| | \__ \ |__| | |_) |
// |_|  \_\___|\__,_|_|___/_____/|____/ 

export let redis_databases:{ [key: string]: { cs:string, client:any } } = {};

/**
 * This function is used to connect to a Redis database.
 * 
 * @param cs string - the conection uri of the redis server
 * @param name string - the name you want to give to the database
 * @returns redis.RedisClient - a redis client
 */
export function addRedisDB(cs:string, name:string):any {
    // Connect to the redis server
    const client = createClient({ url: cs });
    
    // on error, just log it for now
    // TODO: handle this better
    client.on('error', err => {
        console.log(err);
    });

    // Add the database to the list of databases
    redis_databases[name] = {
        cs,
        client
    };
    
    // Return the client
    return client;
}

export function getRedisDBclient(name:string, res?:any):any {
    // If the database doesn't exist, throw an error
    if(!redis_databases[name]) {
        // If the response object is defined, send an error to the client
        if(res) httpErrorHandler(500, res, returnLocal(locals.KEYS.DATABASE_UNKNOWN_ERROR));

        // Otherwise, throw an error
        else throw new Error(`Redis database ${name} not found`);
    }

    // Return the client
    return redis_databases[name].client;
}