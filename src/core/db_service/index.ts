import { Collection, MongoClient } from "mongodb";

export interface MongoDatabasesInterface {
    [key: string]: { 
        cs:string, 
        collection:string, 
        client:MongoClient 
    };
}


//---------[ MONGODB FUNCTIONS ]---------//

interface MongoFunctions {
    mongo_databases: MongoDatabasesInterface;
    addDB: (cs:string, db:string, collection:string) => Promise<MongoClient>;
    getClient: (db:string, collection?:string, res?:any) => Collection<{[key: string | number]: any}>;
}

export const mongoDB:MongoFunctions = require("./src/mongoDB");

//---------------------------------------//
