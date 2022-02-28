import { ObjectId } from "mongodb";
import { mongoDB } from "../../../db_service";
import { ContentInterface, ErrorInterface } from "../../../interfaces";
import { locals, returnLocal } from "../../../response_handler";

/**
 * This function is used get content from the database, only used by plugins.
 * 
 * @param id - The id of the content to get
 */
export default async function(post_id:ObjectId | ObjectId[], filter?:any): Promise<ErrorInterface | ContentInterface[]> {
    return new Promise(async(resolve, reject) => {
        
        // check if the post_id is an array, if not, make it an array
        if((post_id as ObjectId[])?.length === undefined)
        post_id = [post_id] as ObjectId[];

        // make sure the post_id is an array of ObjectIds type
        else post_id = post_id as ObjectId[];

        // validate user_id
        post_id.forEach((id:ObjectId) => {
            if(ObjectId.isValid(id) !== true) return reject({
                local_key: locals.KEYS.INVALID_ID,
                message: returnLocal('INVALID_ID'),
                where: id.toString(),
            } as ErrorInterface);
        });

        let mask:any = [
            {
                $match: {
                    _id: { $in: post_id },
                }
            }
        ]

        // add the filter if it exists
        if(filter) mask = [...mask, { $project: filter }];

        // get the users from the database
        return resolve(await mongoDB.getClient(global.__MONGO_DB__, global.__COLLECTIONS__.content).aggregate(mask).toArray() as ContentInterface[]);
    });
}