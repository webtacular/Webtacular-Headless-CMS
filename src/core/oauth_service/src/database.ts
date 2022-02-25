import { mongoDB } from "../../db_service";
import { OauthInterface } from "../../interfaces";

/**
 * this function is used to get a user in the database
 * 
 * @param id - The user id to update
 * @param filter - The filter to use while fetching the user
 * @returns Promise<UserInterface[]> - The user object array or the error key 
 */
export default async function (id:string, filter?:any):Promise<OauthInterface[]> {
    let mask:any = [
        {
            $match: {
                oauth_id: id,
            }
        }
    ]

    // add the filter if it exists
    if(filter) mask = [...mask, { $project: filter }];

    // get the users from the database
    return await mongoDB.getClient(
        global.__DEF_MONGO_DB__, 
        global.__AUTH_COLLECTIONS__.oauth_collection
    ).aggregate(mask).toArray() as OauthInterface[];
}