import { ObjectId } from "mongodb";
import { ErrorInterface, RoleInterface, UserInterface } from "../../interfaces";
import { addID, get as get_role, removeID } from "./manageRole";
import { user as userDB } from "../../user_service";
import getUser from "../../user_service/src/get";

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
            return { local_key: 'USER_NOT_FOUND' };

        return false;
    }

    //---------[ User found ]---------//
    let roles:RoleInterface[] = [];

    // Loop through the roles that the user has
    for(let role of user_data.permissions.roles) {

        // Get the role
        let role_data = get_role(role.toLowerCase());

        // if the role is found, push it to the roles array
        if(role_data) roles.push(role_data);

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
export async function has(user: UserInterface | ObjectId, roles:string[], returnErrorKey?:boolean):Promise<string[] | ErrorInterface> {
    let data;

    // Get the roles that the user has
    if(user instanceof ObjectId)
        data = await get(user);
    else data = user;

    // place the roles that the user has into this array
    let has_roles:string[] = [];

    // if the user dosent exist, return an error
    if(data === false) {
        if(returnErrorKey === true)
            return { local_key: 'USER_NOT_FOUND' };

        return [];
    }

   // make sure the data is in the correct type
   else data = data as UserInterface;

    // Loop through the roles that the user has
    data?.permissions?.roles?.forEach(user_role => {
        roles?.forEach(role => {

            // If the user has the role, set the has_role to true
            if(user_role.toLowerCase() === role.toLowerCase())
                has_roles = [...has_roles, role];
        });
    });


    // Return the has_role
    if(returnErrorKey === true && has_roles === [])
        return { local_key: 'USER_HAS_NO_ROLE' };

    return has_roles;
}

/**
 * Adds a role to a user
 * 
 * @param user ObjectId - the user to add the role to, if it is an object id it will be fetched from the database, if it is a user object it will be used directly
 * @param role string - the role to add
 * @param returnErrorKey boolean - if true, the error key will be returned
 * 
 * @returns boolean | ErrorInterface - true if the user has the role, false if not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
*/
export async function add(user: ObjectId, role:string, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> {
    return edit_data(user, role, 'add', returnErrorKey);
}

/**
 * removes a role from a user
 * 
 * @param user ObjectId - the user to remove the role from, if it is an object id it will be fetched from the database, if it is a user object it will be used directly
 * @param role string - the role to remove
 * @param returnErrorKey boolean - if true, the error key will be returned
 * 
 * @returns boolean | ErrorInterface - true if the user has the role removed or if they didint have it to begin with, false if not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
*/
export async function remove(user: ObjectId, role:string, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> {
    return edit_data(user, role, 'remove', returnErrorKey);
}

async function edit_data(user: ObjectId, role:string, action:string, returnErrorKey?:boolean,):Promise<boolean | ErrorInterface> {
    // make sure the role is in lowercase
    role = role.toLowerCase();

    // Get the user
    let user_data = await getUser(user);

    // if the user dosent exist, return an error
    if(user_data === false) {
        if(returnErrorKey === true)
            return { local_key: 'USER_NOT_FOUND' };

        return false;
    }
    else user_data = user_data as UserInterface;

    // Get the roles that the user has
    let role_array:Array<string> = [...user_data.permissions.roles];

    // check if the user already has the role
    switch(action) {
        case 'add':
            if(await has(user_data, [role]) === true)
                return true;

            // Add the role to the user
            role_array.push(role);

            // Update the role user id's
            addID(role, user);
            break;

        case 'remove':
            if(await has(user_data, [role]) === false)
                return true;

            // Remove the role from the user
            role_array = role_array.filter(role => role !== role);

            // Update the role user id's
            removeID(role, user);
            break;
    }

    // create an object to store the new roles
    let role_data:any = { permissions: { roles: role_array } };
    
    // update the user
    let result = userDB.update(user, role_data, true);

    // if the update failed, return an error
    if((result as ErrorInterface).local_key) {
        if(returnErrorKey === true)
            return result as ErrorInterface;

        return false;
    }

    // Return true
    return true;
}