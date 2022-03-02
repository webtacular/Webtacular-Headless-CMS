import { ObjectId } from "mongodb";
import { globalRoleObject } from "../../global_service";
import { ErrorInterface, GlobalRoleObject, RoleInterface } from "../../interfaces";

/**
 * This function gets the specified role object.
 * 
 * @param id: ObjectId | Array<ObjectId> - If an array is passed, it will return an array of role objects, if a sole ObjectId is passed, it will return a single role object.
 * 
 * @returns Promise<ErrorInterface | RoleInterface | Array<RoleInterface>>  
 */
export default async(id: ObjectId | Array<ObjectId>): Promise<ErrorInterface | RoleInterface | Array<RoleInterface>> => {
    return new Promise(async (resolve, reject) => {
        // Toggled to true if the id is an array
        let wasArray = true;

        // check if the ObjectID is an array, if not, make it an array
        if((id as Array<ObjectId>)?.length === undefined) {
            id = [id] as Array<ObjectId>;
            wasArray = false;
        }

        // Convert the ObjectId array to a string array 
        let ids = (id as Array<ObjectId>).map((id: ObjectId) => id.toString());       

        // get the roles from the database
        let roles = (await globalRoleObject.get({
            roles: 1,
        }).catch(reject) as GlobalRoleObject).roles as Array<RoleInterface>;

        // Create an array to hold the roles
        let roleArray: Array<RoleInterface> = [];

        // get the roles from the global role object
        roles.forEach((role) => {
            if(ids.includes(role._id.toString())) roleArray.push(role);
        });

        // if the id was an array, return the array of roles
        if(wasArray) return resolve(roleArray);

        // Else, just return the role
        else return resolve(roleArray[0] || []);
    });
}