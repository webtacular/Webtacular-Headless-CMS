import { Collection, MongoClient } from "mongodb";
import { JsonDB } from 'node-json-db';

export interface MongoDatabasesInterface {
    [key: string]: { 
        cs:string, 
        collection:string, 
        client:MongoClient 
    };
}

export interface LocalDatabasesInterface {
    [key: string]: JsonDB;
}

//---------[ MONGODB FUNCTIONS ]---------//

interface MongoFunctions {
    mongo_databases: MongoDatabasesInterface;
    addDB: (cs:string, db:string, collection:string) => Promise<MongoClient>;
    getClient: (db:string, collection?:string, res?:any) => Collection<{[key: string | number]: any}>;
}

export const mongoDB:MongoFunctions = require("./src/mongoDB");

//---------------------------------------//


//---------[ LOCALDB FUNCTIONS ]---------//

interface LocalFunctions {
    local_databases: LocalDatabasesInterface;
    addDB: (name:string) => JsonDB;
    getDB: (name:string) => JsonDB;
}

export const localDB:LocalFunctions = require("./src/localDB");

//---------------------------------------//