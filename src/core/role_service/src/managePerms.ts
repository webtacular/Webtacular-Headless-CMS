import { ObjectId } from "mongodb";
import { ErrorInterface, RoleInterface, UserInterface } from "../../interfaces";
import { get as get_role } from "./manageRole";
import getUser from "../../user_service/src/get";

/**
 * 
 * @param user UserInterface | ObjectId - the user to check, if it is an object id it will be fetched from the database, if it is a user object it will be used directly
 * @param permission string - the permission to check
 * @param returnErrorKey boolean - if true, the error key will be returned
 * 
 * @returns boolean | ErrorInterface - true if the user has the permission, false if not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
 */
export async function has(user: UserInterface | ObjectId, permission:string, returnErrorKey?: boolean):Promise<boolean | ErrorInterface>  {
    let user_data:any = user,
        permission_found = false;

    if(user instanceof ObjectId)
        user_data = await getUser(user);

    //---------[ User not found ]---------//
    if(!user_data?.permissions?.roles) {
        if(returnErrorKey === true)
            return { local_key: 'USER_NOT_FOUND' };

        return false;
    }

    //---------[ User found ]---------//
    for(let role in user_data.permissions.roles) {
        // get the permissions of the role
        let role_data = get(user_data.permissions.roles[role]);

        // if the role is not found, continue
        if(role_data instanceof Array)
            // check if the permission is in the role
            if(role_data.includes(permission))
                permission_found = true;
    }

    //---------[ return ]---------//
    if(permission_found === false && returnErrorKey === true)
        return { local_key: 'PERMISSION_NOT_FOUND' };

    return permission_found;
}

/**
 * 
 * @param role string - the name of the role to get
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns boolean | ErrorInterface | Array<string> - true if the role was deleted, false if it was not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj,
 *          if 'returnErrorKey' is false, the output will be an array of permissions
 */
export function get(role: string, returnErrorKey?: boolean):Array<string> | ErrorInterface | boolean {
    let role_data = get_role(role);

    if(!role_data) {
        if(returnErrorKey === true)
            return { local_key: 'ROLE_NOT_FOUND' };

        return false;
    }

    return role_data.permissions;
}