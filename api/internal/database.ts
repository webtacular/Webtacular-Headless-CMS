import { Collection, MongoClient } from 'mongodb';
import { httpErrorHandler } from '../public/response_handler';

export let mongo_databases:{ [key: string]: { uri:string, collection:string, client:MongoClient } } = {};

export async function addMongoDB(uri:string, db:string, collection:string):Promise<void> {
    const client = new MongoClient(uri);

    await client.connect().catch((err) =>{ throw err; });

    mongo_databases[db] = {
        uri,
        collection,
        client
    };
}

// Im using this as a general schema that allows you to pass any object to the database
// schema validation is done by typescript's interface's
interface schema {
    [key: string | number]: any;
}

export function getMongoDBclient(db:string, collection:string = mongo_databases[db].collection, res?:any):Collection<schema> {
    if(!mongo_databases[db]) {
        if(res) httpErrorHandler(500, res, `MongoDB database not found`);
        else throw new Error(`MongoDB database ${db} not found`);
    }

    if(!collection) collection = mongo_databases[db].collection;
    console.log(collection);
    return (mongo_databases[db].client.db(db).collection<schema>(collection));
}