import { mongoDB } from "../../db_service";
import { OauthInterface } from "../../interfaces";

/**
 * this function is used to get a Oauth2 Instance from the database
 * 
 * @param id - the id of the Oauth2 Instance
 * @param filter - The filter to use while fetching the  Oauth2 Instance
 * @returns Promise<OauthInterface[]> - The Oauth2 Instance array, will be empty if no Oauth2 Instance is found, 
 *                                     But it will only ever return one Oauth2 Instance.
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