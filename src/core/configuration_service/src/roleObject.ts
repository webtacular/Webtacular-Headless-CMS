import { ObjectId } from "mongodb";
import { mongoDB } from "../../db_service";
import { ErrorInterface, GlobalRoleObjectInterface } from "../../interfaces";
import { locals } from "../../response_handler";

/** 
 * This function is used to get the global role object, if not it will reject with an ErrorInterface
 * 
 * @param filter - The filter to use while fetching the global role object
 * @returns Promise<GlobalRoleObjectInterface | ErrorInterface> - The global role object or the error object
*/
export const get = async(filter?:any): Promise<GlobalRoleObjectInterface | ErrorInterface> => {
    return new Promise(async(resolve, reject) => {
        // Get the global role object for the correct environment
        let GRO_id = global.__CONFIG__.server.dev ? global.__CONFIG__.global_objects.dev.role : global.__CONFIG__.global_objects.prod.role;
       
        // Create query    
        let mask:any = [
            {
                $match: {
                    _id: new ObjectId(GRO_id)    
                }
            }
        ]

        // add the filter if it exists
        if(filter) mask = [...mask, { $project: filter }];

        // get the global role object from the database
        let res = await mongoDB.getClient(global.__MONGO_DB__, global.__COLLECTIONS__.config).aggregate(mask).toArray() as GlobalRoleObjectInterface[];

        // Check if we got a result
        if(res.length !== 1) return reject({
            code: 0,
            local_key: locals.KEYS.GLOBAL_ROLES_NOT_FOUND,
            where: 'get.ts',
            message: `The global roles could not be found`
        } as ErrorInterface);

        // Return the global role object
        return resolve(res[0]);
    });
}