import { ErrorInterface, RoleInterface } from "../../interfaces";
import { mongoDB } from "../../db_service";
import { remove as user_remove } from "./manageUser";
import validateRole from "./role_validation_service"
import { ObjectId } from "mongodb";
import { locals, returnLocal } from "../../response_handler";

/**
 * adds a role to the database
 * 
 * @param role RoleInterface - the role details to add
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns boolean - true if the role was added, false if not
 */
export async function add(role:RoleInterface, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> {
    
    // validate the role
    let value = validateRole(role, returnErrorKey);

    //----[ if the role is not valid ]----//
    if(value === false)
        return value as boolean;

    else if(returnErrorKey === true && (value as ErrorInterface ).local_key)
        return value as ErrorInterface;
    //------------------------------------//

    // Push the role to the database
    
    // The object to find in the database
    let mongoDBpushOBJ:any = {
        _id: new ObjectId(),
    }

    // merge the role object into the mongoDBpushOBJ
    Object.assign(mongoDBpushOBJ, role);

    return new Promise((resolve:any) => {
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.role_collection).insertOne(mongoDBpushOBJ, async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if (err) {
                if(returnErrorKey === true) return resolve({
                    local_key: locals.KEYS.DB_ERROR,
                    where: 'manageRole.ts',
                    message: err.message
                } as ErrorInterface);

                return resolve(false);
            }
            
            // If we successfully added the role, return true
            resolve(true);
        });
    });
}

/**
 * fetches a role from the database
 * 
 * @param role ObjectId - the ObjectId of the role to fetch
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns RoleInterface, false - the role details if found, false if not
*/
export async function get(role:ObjectId, returnErrorKey?:boolean):Promise<RoleInterface | false | ErrorInterface> {
    // The object to find in the database
    let mongoDBfindOBJ:any = {
        _id: role
    }

    return new Promise((resolve:any) => {
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.role_collection).findOne(mongoDBfindOBJ, async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if (err) {
                if(returnErrorKey === true) return resolve({
                    local_key: locals.KEYS.DB_ERROR,
                    where: 'manageRole.ts',
                    message: err.message
                } as ErrorInterface);

                return resolve(false);
            }

            //----------[ No role found ]----------//

            // If we cant find the user, return a 404
            if (!result) {
                if(returnErrorKey === true) return resolve({
                    local_key: locals.KEYS.ROLE_NOT_FOUND,
                } as ErrorInterface);

                return resolve(false);
            }

            //----------[ Role found ]----------//
            
            // If we found the role, return the role object
            resolve(result);
        });
    });
}

/**
 * deletes a role from the database
 * 
 * @param role_name string - the name of the role to delete
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns boolean | ErrorInterface - true if the role was deleted, false if it was not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
*/
export async function remove(role:ObjectId, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> {

    // find the role in the database
    let role_info = await get(role);

    //----[ if the role does not exist ]----//
    if(role_info === false){
        if(returnErrorKey === true)
            return { 
                local_key: 'ROLE_NOT_FOUND',
                message: returnLocal(locals.KEYS.ROLE_NOT_FOUND)
            };

        else return false;
    }

    // Make sure that the role is the right type
    else role_info = role_info as RoleInterface;

    // loop through the users that have the role, and remove the role from them
    for(let user of role_info.users) {
        await user_remove(user, role);
    }

    // The object to find in the database
    let mongoDBremoveOBJ:any = {
        _id: role
    }

    return new Promise((resolve:any) => {
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.role_collection).findOneAndDelete(mongoDBremoveOBJ, async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if (err) {
                if(returnErrorKey === true) return resolve({
                    local_key: locals.KEYS.DB_ERROR,
                    where: 'manageRole.ts',
                    message: err.message
                } as ErrorInterface);

                return resolve(false);
            }
            
            // If we successfully removed the role, return true
            resolve(true);
        });
    });
}

/**
 * updates a role in the database
 * 
 * @param role ObjectId - the ObjectId of the role to update
 * @param new_role RoleInterface - the new role details
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns boolean | ErrorInterface - true if the role was deleted, false if it was not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
 */
export async function update(role:ObjectId, new_role:RoleInterface, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> {

    // validate the role
    let value = validateRole(new_role, returnErrorKey);

    //----[ if the role is not valid ]----//
    if(value === false)
        return value as boolean;

    else if(returnErrorKey === true && (value as ErrorInterface ).local_key)
        return value as ErrorInterface;
    //------------------------------------//

    // The object to find in the database
    let mongoDBupdateOBJ:any = {
        _id: role
    }

    return new Promise((resolve:any) => {
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.role_collection).findOneAndUpdate(mongoDBupdateOBJ, { $set: role as any }, async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if (err) {
                if(returnErrorKey === true) return resolve({
                    local_key: locals.KEYS.DB_ERROR,
                    where: 'manageRole.ts',
                    message: err.message
                } as ErrorInterface);

                return resolve(false);
            }

            //----[ if the role does not exist ]----//
            if(!result){
                if(returnErrorKey === true)
                    return { 
                        local_key: 'ROLE_NOT_FOUND',
                        message: returnLocal(locals.KEYS.ROLE_NOT_FOUND)
                    };

                else return false;
            }
            
            // If we successfully removed the role, return true
            resolve(result);
        });
    });
}

/**
 * adds a user id to a role
 * 
 * @param role ObjectId - the ObjectId of the role to update
 * @param user_id ObjectId - the id of the user to add
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns boolean | ErrorInterface - true if the role was deleted, false if it was not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj
 */
export async function addID(role:ObjectId, user_id:ObjectId, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> {
    return modifyID(role, user_id, 'add', returnErrorKey);
}

/**
 *  removes a user id from a role
 * 
 * @param role ObjectId - the ObjectId of the role to update
 * @param user_id ObjectId - the id of the user to remove
 * @param returnErrorKey boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns boolean | ErrorInterface - true if the role was deleted, false if it was not, if 'returnErrorKey' is true, the error key will be returned as a 'RoleError' obj */
export async function removeID(role:ObjectId, user_id:ObjectId, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> {
    return modifyID(role, user_id, 'remove', returnErrorKey);
}

async function modifyID(role:ObjectId, user_id:ObjectId, action:string, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> {

    // find the role in the database
    let role_data = await get(role);

    //----[ if the role does not exist ]----//
    if(role_data === false) {
        if(returnErrorKey === true)
            return { 
                local_key: 'ROLE_NOT_FOUND',
                message: returnLocal(locals.KEYS.ROLE_NOT_FOUND)
            };
    
        return false;
    }

    // Make sure that the role is the right type
    else role_data = role_data as RoleInterface;

    switch(action) {
        case 'add':
            // update the role in the database
            role_data.users = [...role_data.users, user_id];
            break;

        case 'remove':
            // remove the user id from the role
            role_data.users.splice(role_data.users.indexOf(user_id), 1);
            break;
    }

    // Update the role in the database
    return update(role, role_data, returnErrorKey);
}
