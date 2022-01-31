import { ObjectId } from "mongodb";
import { mongoDB } from "../../db_service";
import { ErrorInterface, UserInterface } from "../../interfaces";
import { locals } from "../../response_handler";

/**
 * this function is used to update a user in the database
 * 
 * @param user_id - The user id to update
 * @param user - The user object to update
 * @param returnErrorKey - If true, return the error key instead of the user object
 * @returns Promise<UserInterface | boolean | ErrorInterface> - The user object or the error key
 */
export default async function (user_id:ObjectId, user:any, returnErrorKey?:boolean):Promise<UserInterface | boolean | ErrorInterface> {
    // validate user_id
    if(ObjectId.isValid(user_id) !== true){
        if(returnErrorKey === true) return {
            local_key: locals.KEYS.INVALID_ID,
        } as ErrorInterface;

        return false;
    }

    // The object to find in the database
    let mongoDBfindOBJ:any = {
        _id: new ObjectId(user_id)
    }

    return new Promise((resolve:any) => {
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.user_collection).findOneAndUpdate(mongoDBfindOBJ, { $set: user }, async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if (err) {
                if(returnErrorKey === true) return resolve({
                    local_key: locals.KEYS.DB_ERROR,
                    where: 'update.ts',
                    message: err.message
                });

                return resolve(false);
            }

            //----------[ No user found ]----------//

            // If we cant find the user, return a 404
            if (!result) {
                if(returnErrorKey === true) return resolve({
                    local_key: locals.KEYS.USER_NOT_FOUND,
                });

                return resolve(false);
            }

            //----------[ User found ]----------//
            
            // If we found the user, return the user object
            resolve(result);
        });
    });
}