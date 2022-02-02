import { ObjectId } from "mongodb";
import { mongoDB } from "../../../db_service";
import { ContentInterface, ErrorInterface } from "../../../interfaces";
import { locals, returnLocal } from "../../../response_handler";
import read from "./read";

/**
 * This function is used update content in the database, only used by plugins.
 * 
 * @param post_id - The id of the content to update
 * @param content - The new content to update
 * @param strict - default true, it will only update if the content type is the same as the old content type
 * @param returnError - If true, the function will return an error object, else it will return a boolean if an error occured
 */
export default async function(post_id:ObjectId | ObjectId[], new_content:{ content:any, owner?:ObjectId }, strict:boolean = true, returnError?:boolean): Promise<boolean | ErrorInterface | ContentInterface[]> {
    // try to remove the content from the database
    return new Promise(async(resolve:any, reject:any) => {
        // Check if an owner was set, if so, we need to update the user
        let mongoDBfindOBJ:any = {
            _id: post_id
        };

        // try and locate the content
        let content:any = await read(post_id, undefined, true).catch((err:ErrorInterface) => { throw new Error("Error in update.ts: " + err.message) });
        content = content as ContentInterface;

        // if we cant find the content, return an error/false
        if (!content) {
            if(returnError === true) return reject({ 
                local_key: locals.KEYS.NOT_FOUND,
                where: 'update.ts',
                message: returnLocal(locals.KEYS.NOT_FOUND)
            });

            return reject(false);       
        }

        // if the content type is not the same as the old content type, and strict is true, return an error
        if (strict && content.content.type !== content.content.type) {
            if(returnError === true) return reject({
                local_key: locals.KEYS.INVALID_CONTENT_TYPE,
                where: 'update.ts',
                message: returnLocal(locals.KEYS.INVALID_CONTENT_TYPE)
            });
            
            return reject(false);
        }   

        // update the content
        Object.assign(content, new_content);

        // update the content history
        content.history.push({
            type: "update",
            owner: content?.owner,
            date: new Date(),       
            content: content.content   
        });   


        // Find and remove the content
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.content_collection).findOneAndUpdate(mongoDBfindOBJ, { $set: content }, (err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if (err) {
                if(returnError === true) return reject({
                    local_key: locals.KEYS.DB_ERROR,
                    where: 'update.ts',
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