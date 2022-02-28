import { ObjectId } from "mongodb";
import { mongoDB } from "../../db_service";
import { UserInterface } from "../../interfaces";

/**
 * this function is used to get a user in the database
 * 
 * @param id - The user id to update
 * @param filter - The filter to use while fetching the user
 * @returns Promise<UserInterface[]> - The user object array or the error key 
 */
export default async function (id:ObjectId | ObjectId[], filter?:any):Promise<UserInterface[]> {
    
    // check if the user_id is an array, if not, make it an array
    if((id as ObjectId[])?.length === undefined)
        id = [id] as ObjectId[];

    // make sure the user_id is an array of ObjectIds type
    else id = id as ObjectId[];

    let mask:any = [
        {
            $match: {
                _id: { $in: id },
            }
        }
    ]

    // add the filter if it exists
    if(filter) mask = [...mask, { $project: filter }];

    // get the users from the database
    return await mongoDB.getClient(global.__MONGO_DB__, global.__COLLECTIONS__.user).aggregate(mask).toArray() as UserInterface[];
}