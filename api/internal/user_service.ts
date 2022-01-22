import {ObjectId} from "mongodb";
import {getMongoDBclient} from "./db_service";
import {UserInterface} from "./interfaces";
import {httpErrorHandler, locals, returnLocal} from "./response_handler";

export async function getUser(user_id:ObjectId, res?:any):Promise<UserInterface | boolean> {
    // validate user_id
    if(ObjectId.isValid(user_id) !== true)
        return false;

    // The object to find in the database
    let mongoDBfindOBJ:any = {
        _id: new ObjectId(user_id)
    }

    new Promise((resolve:any) => {
        getMongoDBclient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.user_collection).findOne(mongoDBfindOBJ, async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if (err) return console.log(err);

            //----------[ No user found ]----------//

            // If we cant find the user, return a 404
            if (result === null || result === undefined && res)
                return httpErrorHandler(404, res, returnLocal(locals.KEYS.USER_NOT_FOUND, locals.language));

            else if (result === null || result === undefined)
                return resolve(false);
            

            //----------[ User found ]----------//
            
            // If we found the user, return the user object
            resolve(result);
        });
    });
}