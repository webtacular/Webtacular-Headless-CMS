import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import { locals, returnLocal } from '../../response_handler';
import { MongoDatabasesInterface } from '..';
import {ErrorInterface} from '../../interfaces';

// Variable that stores our MongoDB Databases.
export let mongo_databases:MongoDatabasesInterface = {};

/**
 * This function is used to connect to a MongoDB database.
 * 
 * @param cs string - the Connection string of your MongoDB database
 * @param db string - the name of the database to connect to
 * @param collection string - the name of the collection to use, can be changed later
 * 
 * @returns Promise<MongoClient> - a promise that resolves to a MongoClient
**/
export async function addDB(cs:string, db:string, collection:string):Promise<MongoClient> {
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
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * 
 * @returns Collection - the collection object
**/
export function getClient(db:string, collection?:string, returnError?:boolean):Collection<{[key: string | number]: any}> | ErrorInterface {
    // If the database doesn't exist, throw an error
    if(!mongo_databases[db]) {
        // If the response object is defined, send an error to the client
        if(returnError === true) return {
            code: 0,
            local_key: 'DATABASE_UNKNOWN_ERROR',
            message: returnLocal(locals.KEYS.DATABASE_UNKNOWN_ERROR)
        } as ErrorInterface;

        // Otherwise, throw an error
        else throw new Error(`MongoDB database ${db} not found`);
    }

    // If a collection is not provided, use the default collection
    if(!collection) collection = mongo_databases[db].collection;

    // Return the collection
    return (mongo_databases[db].client.db(db).collection<{[key: string | number]: any}>(collection));
}