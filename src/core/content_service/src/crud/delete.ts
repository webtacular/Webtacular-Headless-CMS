import { ObjectId } from "mongodb";
import { mongoDB } from "../../../db_service";
import { ErrorInterface } from "../../../interfaces";
import { locals, returnLocal } from "../../../response_handler";

/**
 * This function is used to delete content from the database, only used by plugins.

 * owner is optional, if it is not set, it will be left undefined, else it has to be a valid users id, them being the owner of the content allows them to modify it.
 * content: this is where the plugins data is stored, the rest is just metadata;
 * 
 * @param id ObjectId - The id of the content to delete
 *
*/
export default async function(id:ObjectId): Promise<boolean | ErrorInterface> {
    // try to remove the content from the database
    return new Promise(async(resolve:any, reject:any) => {
        // Check if an owner was set, if so, we need to update the user
        let mongoDBfindOBJ:any = {
            _id: id
        };

        // Find and remove the content
        mongoDB.getClient(global.__MONGO_DB__, global.__COLLECTIONS__.content).deleteOne(mongoDBfindOBJ, (err:any, result:any) => {
            //----------[ Data base Error ]----------//
            if (err) return reject({
                local_key: locals.KEYS.DB_ERROR,
                where: 'delete.ts',
                message: err.message
            });


            //---------[ No content found ]---------//
            // If we cant find the content, return a 404
            if (!result) return reject({
                local_key: locals.KEYS.NOT_FOUND,
                where: 'delete.ts',
                message: returnLocal(locals.KEYS.NOT_FOUND)
            });


            //----------[ Content found ]----------//
            // If we found the content, return true, as we deleted it
            resolve(true);
        });    
    });
}