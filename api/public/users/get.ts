import { getMongoDBclient } from "../../internal/database";
import { UserInterface } from "../interfaces";
import { ObjectId } from 'mongodb';

export default async (req:any, res:any, resources:string[]):Promise<void> => {
    const toInsert = {
        _id: new ObjectId(), 
        someField: 'hello',
        someOtherField: 'world'
      };


    let result:any = await getMongoDBclient(global.__DEF_MONGO_DB__, undefined, res).insertOne(toInsert, (err:any, result:any) => {
        if (err) throw err;
        console.log(result);
    });

    result = await getMongoDBclient(global.__DEF_MONGO_DB__, undefined, res).findOne(toInsert, (err:any, result:any) => {
        if (err) throw err;
        console.log(result);
    });
    
    res.status(200).send(toInsert);
    res.end();
}