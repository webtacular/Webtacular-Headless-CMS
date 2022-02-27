import { ObjectId } from "mongodb";
import {mongoDB} from "../../../db_service";
import { AddonInterface, ContentInterface, ErrorInterface } from "../../../interfaces";
import { locals, mongoErrorHandler, returnLocal } from "../../../response_handler";
import { user } from "../../../user_service";

/**
 * This function is used to delete content from the database, only used by plugins.

 * owner is optional, if it is not set, it will be left undefined, else it has to be a valid users id, them being the owner of the content allows them to modify it.
 * content: this is where the plugins data is stored, the rest is just metadata;
 * 
 * @param id ObjectId - The id of the content to delete
 *
 * @returns - If returnError is true, the function will return an error object, else it will return a boolean if an error occured
*/
export default async function(id:ObjectId, returnError?: boolean): Promise<boolean | ErrorInterface> {
    // try to remove the content from the database
    return new Promise(async(resolve:any, reject:any) => {
        // Check if an owner was set, if so, we need to update the user
        let mongoDBfindOBJ:any = {
            _id: id
        };

        // Find and remove the content
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__COLLECTIONS__.content_collection).deleteOne(mongoDBfindOBJ, (err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if (err) {
                if(returnError === true) return reject({
                    local_key: locals.KEYS.DB_ERROR,
                    where: 'delete.ts',
                    message: err.message
                });

                return reject(false);
            }

            //----------[ No content found ]----------//

            // If we cant find the content, return a 404
            if (!result) {
                if(returnError === true) return reject({
                    local_key: locals.KEYS.NOT_FOUND,
                    where: 'delete.ts',
                    message: returnLocal(locals.KEYS.NOT_FOUND)
                });

                return reject(false);
            }

            //----------[ Content found ]----------//

            // If we found the content, return true, as we deleted it
            resolve(true);
        });    
    });
}