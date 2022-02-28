import { ObjectId } from "mongodb";
import { mongoDB } from "../../db_service";
import { ErrorInterface, UserInterface } from "../../interfaces";
import { locals, returnLocal } from "../../response_handler";

/**
 * this function is used to update a user in the database
 * 
 * @param id - The user id to update
 * @param user ObjectId - The user object to update
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * @returns Promise<UserInterface | boolean | ErrorInterface> - The user object or the error key
 */
export default async function (id:ObjectId, user:any, returnError?:boolean):Promise<UserInterface | boolean | ErrorInterface> {
    return new Promise((resolve:any, reject:any) => {

        // The object to find in the database
        let mongoDBfindOBJ:any = {
            _id: id
        }

        mongoDB.getClient(global.__MONGO_DB__, global.__COLLECTIONS__.user).findOneAndUpdate(mongoDBfindOBJ, { $set: user }, async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if(err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: returnLocal(locals.KEYS.DB_ERROR),
                    where: 'user_service.update',              
                } as ErrorInterface);
                
                return reject(false);
            }

            //----------[ No user found ]----------//

            // If we cant find the user, return a 404
            if (!result) {
                if(returnError === true) return reject({
                    code: 1,
                    local_key: locals.KEYS.NOT_FOUND,
                    message: returnLocal(locals.KEYS.NOT_FOUND),
                });
    
                return reject(false);
            }

            //----------[ User found ]----------//
            
            // If we found the user, return the user object
            resolve(result);
        });
    });
}