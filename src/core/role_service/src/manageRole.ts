import { ErrorInterface, RoleInterface } from "../../interfaces";
import { localDB } from "../../db_service";
import { db_name } from "..";
import { remove as user_remove } from "./manageUser";
import validateRole from "./role_validation_service"
import {ObjectId} from "mongodb";
import {locals, returnLocal} from "../../response_handler";

/**
 * adds a role to the database
 * 
 * @param role RoleInterface - the role details to add
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns boolean - true if the role was added, false if not
 */
export function add(role:RoleInterface, returnErrorKey?:boolean):boolean | ErrorInterface {
    
    // validate the role
    let value = validateRole(role, returnErrorKey);

    //----[ if the role is not valid ]----//
    if(value === false)
        return value as boolean;

    else if(returnErrorKey === true && (value as ErrorInterface ).local_key)
        return value as ErrorInterface;
    //------------------------------------//

    // Push the role to the database
    localDB.getDB(db_name).push(`/roles/${role.name.toLowerCase()}`, role);

    // Return true
    return true;
}

/**
 * fetches a role from the database
 * 
 * @param name string - the name of the role to fetch
 * 
 * @returns RoleInterface, false - the role details if found, false if not
*/
export function get(name:string):RoleInterface | false {
    try {
        // try to get the role from the database
        return localDB.getDB(db_name).getData(`/roles/${name.toLowerCase()}`);
    }
    catch {
        // if the role does not exist, return false
        return false;
    }
}

/**
 * deletes a role from the database
 * 
 * @param role_name string - the name of the role to delete
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns boolean | ErrorInterface - true if the role was deleted, false if it was not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
*/
export function remove(role_name:string, returnErrorKey?:boolean):boolean | ErrorInterface {
    // make sure the role is in lowercase
    role_name = role_name.toLowerCase();

    // find the role in the database
    let role = get(role_name);

    //----[ if the role does not exist ]----//
    if(role === false){
        if(returnErrorKey === true)
            return { 
                local_key: 'ROLE_NOT_FOUND',
                message: returnLocal(locals.KEYS.ROLE_NOT_FOUND)
            };

        else return false;
    }

    // loop through the users that have the role, and remove the role from them
    for(let user of role.users) {
        user_remove(user, role_name);
    }

    // Remove the role from the database
    localDB.getDB(db_name).delete(`/roles/${role_name}`);

    // Return true
    return true;
}

/**
 * updates a role in the database
 * 
 * @param role_name string - the name of the role to update
 * @param role RoleInterface - the new role details
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns boolean | ErrorInterface - true if the role was deleted, false if it was not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
 */
export function update(role_name:string, role:RoleInterface, returnErrorKey?:boolean): boolean | ErrorInterface {
    // make sure the role is in lowercase
    role_name = role_name.toLowerCase();

    // find the role in the database
    let old_role = get(role_name);

    //----[ if the role does not exist ]----//
    if(old_role === false){
        if(returnErrorKey === true)
            return { 
                local_key: 'ROLE_NOT_FOUND',
                message: returnLocal(locals.KEYS.ROLE_NOT_FOUND)
            };

        else return false;
    }

    // validate the role
    let value = validateRole(role, returnErrorKey);

    //----[ if the role is not valid ]----//
    if(value === false)
        return value as boolean;

    else if(returnErrorKey === true && (value as ErrorInterface ).local_key)
        return value as ErrorInterface;
    //------------------------------------//

    // Update the role in the database
    localDB.getDB(db_name).push(`/roles/${role_name}`, role, true);

    // Return true
    return true;
}

/**
 * adds a user id to a role
 * 
 * @param role_name string - the name of the role to update
 * @param user_id ObjectId - the id of the user to add
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns boolean | ErrorInterface - true if the role was deleted, false if it was not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
 */
export function addID(role_name:string, user_id:ObjectId, returnErrorKey?:boolean):boolean | ErrorInterface {
    return modifyID(role_name, user_id, 'add', returnErrorKey);
}

/**
 *  removes a user id from a role
 * 
 * @param role_name string - the name of the role to update
 * @param user_id ObjectId - the id of the user to remove
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns boolean | ErrorInterface - true if the role was deleted, false if it was not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj */
export function removeID(role_name:string, user_id:ObjectId, returnErrorKey?:boolean):boolean | ErrorInterface {
    return modifyID(role_name, user_id, 'remove', returnErrorKey);
}

function modifyID(role_name:string, user_id:ObjectId, action:string, returnErrorKey?:boolean):boolean | ErrorInterface {
    // make sure the role is in lowercase
    role_name = role_name.toLowerCase();

    // find the role in the database
    let role = get(role_name);

    //----[ if the role does not exist ]----//
    if(role === false) {
        if(returnErrorKey === true)
            return { 
                local_key: 'ROLE_NOT_FOUND',
                message: returnLocal(locals.KEYS.ROLE_NOT_FOUND)
            };
    
        return false;
    }

    switch(action) {
        case 'add':
            // update the role in the database
            role.users = [...role.users, user_id];
            break;

        case 'remove':
            // remove the user id from the role
            role.users.splice(role.users.indexOf(user_id), 1);
            break;
    }

    // update the role in the database
    localDB.getDB(db_name).push(`/roles/${role_name}`, role, true);

    // Return true
    return true;
}
