import { ObjectId } from "mongodb";
import { ErrorInterface, RoleInterface, UserGetInterface, UserInterface } from "../../interfaces";
import { addID, get as get_role, removeID } from "./manageRole";
import { user as userDB } from "../../user_service";
import getUser from "../../user_service/src/get";
import { locals, returnLocal } from "../../response_handler";
import { user as user_service } from "../../user_service";
/**
 * fetches all roles that a user has, and if they have a role that no longer exists, it removes it.
 * 
 * @param user UserInterface | ObjectId - the user to check, if it is an object id it will be fetched from the database, if it is a user object it will be used directly
 * @param returnErrorKey boolean - if true, the error key will be returned
 * @returns RoleInterface[] | ErrorInterface | boolean - the roles the user has if theres an error and 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj, else a boolean will be returned
 */
export async function get(user: UserInterface | ObjectId, returnErrorKey?:boolean):Promise<RoleInterface[] | ErrorInterface | boolean> {
    let user_data:any = user;

    if(user instanceof ObjectId)
        user_data = await getUser(user);

    //---------[ User not found ]---------//
    if(!user_data?.permissions?.roles) {
        if(returnErrorKey === true)
            return { 
                local_key: 'USER_NOT_FOUND',
                message: returnLocal(locals.KEYS.USER_NOT_FOUND)
            };

        return false;
    }

    //---------[ User found ]---------//
    let roles:RoleInterface[] = [];

    // Loop through the roles that the user has
    for(let role of user_data.permissions.roles) {

        // Get the role
        let role_data = await get_role(role) as RoleInterface[];

        // if the role is found, push it to the roles array
        if(role_data) roles.push(role_data[0] as RoleInterface);

        // if the role is not found, remove it from the user
        else remove(user_data, role);
    }

    // Return the roles
    return roles;
}

/**
 * Checks if a user has a role
 * 
 * @param user UserInterface | ObjectId - the user to check, if it is an object id it will be fetched from the database, if it is a user object it will be used directly
 * @param role string - the role to check
 * @param returnErrorKey boolean - if true, the error key will be returned
 * 
 * @returns boolean | ErrorInterface - true if the user has the role, false if not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
*/
export async function has(user: UserInterface | ObjectId, roles:ObjectId[], returnErrorKey?:boolean):Promise<{ [key: string]: boolean } | ErrorInterface> {
    let data;

    // Get the roles that the user has
    if(user instanceof ObjectId)
        data = await user_service.get(user) 
    else data = user;
 
    // place the roles that the user has into this array
    let has_roles:{ [key: string]: boolean } = {};
    
    // if the user dosent exist, return an error
    if(data === false) {
        if(returnErrorKey === true)
            return { 
                local_key: 'USER_NOT_FOUND',
                message: returnLocal(locals.KEYS.USER_NOT_FOUND)
            };

        return {};
    }

    // make sure the data is in the correct type
    else data = data as UserInterface;

    // Loop through the roles that the user has
    data?.permissions?.roles?.forEach(user_role => {
        //console.log(user_role);
        roles?.forEach(role => {

            // If the user has the role, set the has_role to true
            if(user_role.toString() === role.toString())
                Object.assign(has_roles, { [role.toString()]: true });

            // If the user does not have the role, set the has_role to false
            else Object.assign(has_roles, { [role.toString()]: false });
        });
    });


    return has_roles;
}

/**
 * Adds a role to a user
 * 
 * @param user ObjectId - the user to add the role to, if it is an object id it will be fetched from the database, if it is a user object it will be used directly
 * @param role ObjectId - the role to add
 * @param returnErrorKey boolean - if true, the error key will be returned
 * 
 * @returns boolean | ErrorInterface - true if the user has the role, false if not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
*/
export async function add(user: ObjectId, role:ObjectId, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> {
    return edit_data(user, role, 'add', returnErrorKey);
}

/**
 * removes a role from a user
 * 
 * @param user ObjectId - the user to remove the role from, if it is an object id it will be fetched from the database, if it is a user object it will be used directly
 * @param role ObjectId - the role to remove
 * @param returnErrorKey boolean - if true, the error key will be returned
 * 
 * @returns boolean | ErrorInterface - true if the user has the role removed or if they didint have it to begin with, false if not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
*/
export async function remove(user: ObjectId, role:ObjectId, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> {
    return edit_data(user, role, 'remove', returnErrorKey);
}

async function edit_data(user: ObjectId, role:ObjectId, action:string, returnErrorKey?:boolean,):Promise<boolean | ErrorInterface> {
    // Get the user
    let user_data = await getUser(user, { permissions: 1 });

    // if the user dosent exist, return an error
    if(user_data === false) {
        if(returnErrorKey === true)
            return { 
                local_key: 'USER_NOT_FOUND',
                message: returnLocal(locals.KEYS.USER_NOT_FOUND)
            };

        return false;
    }
    else user_data = user_data as UserGetInterface[];

    //TODO: verify that the role exists
    
    // Get the roles that the user has
    let role_array:Array<ObjectId> = [...(user_data[0] as any)?.permissions?.roles];

    // check if the user has the role
    let string_array = role_array.map(role => role.toString()),
        hasRole = string_array.includes(role.toString());
    
    // check if the user already has the role
    switch(action) {
        case 'add':
            if(hasRole === true)
                return true;

            // Add the role to the user
            role_array.push(role);

            // Update the role user id's
            let addRes:boolean | ErrorInterface = await addID(role, user, returnErrorKey);

            // add the role to the user
            if ((addRes as ErrorInterface)?.local_key !== undefined)
                return addRes;

            break;

        case 'remove':
            if(hasRole === false)
                return true;

            // Remove the role from the user
            role_array = role_array.filter(arr_role => arr_role?.toString() !== role?.toString());

            // Update the role user id's
            await removeID(role, user, returnErrorKey);

            break;
    }

    // create an object to store the new roles
    let role_data:any = { permissions: { roles: role_array } };
    
    // update the user
    let result = await userDB.update(user, role_data, true);

    // if the update failed, return an error
    if((result as ErrorInterface).local_key) {
        if(returnErrorKey === true)
            return result as ErrorInterface;

        return false;
    }

    // Return true
    return true;
}