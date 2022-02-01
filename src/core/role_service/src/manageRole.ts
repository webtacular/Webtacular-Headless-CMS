import { ErrorInterface, RoleInterface } from "../../interfaces";
import { mongoDB } from "../../db_service";
import { remove as user_remove } from "./manageUser";
import validateRole from "./role_validation_service"
import { ObjectId } from "mongodb";
import { locals, returnLocal } from "../../response_handler";
import { precedence } from "..";

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

    // floor the precedence
    role.precedence = Math.floor(role.precedence);

    // validate the presence of the role, cant be 0 as that is the default role
    if(role.precedence < 1) {
        if(returnErrorKey === true) return {
            local_key: 'ROLE_PRECEDENCE_NEGATIVE',
            message: returnLocal(locals.KEYS.ROLE_PRECEDENCE_NEGATIVE)  
        }

        return false;
    }

    // make sure that this is not the default role
    role.default = false;

    //TODO: validation dosent work
    // //----[ if the role is not valid ]----//
    // if(value === false || (value as ErrorInterface).message !== undefined)
    //     return value as boolean;

    // else if(returnErrorKey === true && (value as ErrorInterface ).local_key)
    //     return value as ErrorInterface;
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
            
            let precedence_respone = await precedence.set(mongoDBpushOBJ._id, role.precedence);

            console.log(precedence_respone);

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
export async function get(role:ObjectId | ObjectId[], filter?:any, returnErrorKey?:boolean):Promise<RoleInterface[] | false | ErrorInterface> {
    // check if the user_id is an array, if not, make it an array
    if((role as ObjectId[])?.length === undefined)
        role = [role] as ObjectId[];

    // make sure the user_id is an array of ObjectIds type
    else role = role as ObjectId[];

    // validate role id's
    role.forEach((id:ObjectId) => {
        if(ObjectId.isValid(id) !== true) {
            if(returnErrorKey === true) return {
                local_key: locals.KEYS.INVALID_ID,
                message: returnLocal('INVALID_ID'),
                where: id.toString(),
            } as ErrorInterface;
    
            return false;
        }
    });

    let mask:any = [
        {
            $match: {
                _id: { $in: role },
            }
        }
    ]

    // if the filter is set, add it to the mask
    if(filter) mask = [...mask, { $project: filter }];

    // find the role in the database, and return it
    return await mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.role_collection).aggregate(mask).toArray() as RoleInterface[];
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
    else role_info = role_info as RoleInterface[];

    // loop through the users that have the role, and remove the role from them
    for(let user of role_info[0].users) {
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
    //TODO: FIx this validateRole function
    // let value = true; //validateRole(new_role, returnErrorKey);

    // console.log(value);

    // //----[ if the role is not valid ]----//
    // if(value === false)
    //     return value as boolean;

    // else if(returnErrorKey === true && (value as ErrorInterface ).local_key)
    //     return value as ErrorInterface;
    // //------------------------------------//

    // The object to find in the database
    let mongoDBupdateOBJ:any = {
        _id: role
    }

    return new Promise((resolve:any) => {
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.role_collection).findOneAndUpdate(mongoDBupdateOBJ, { $set: new_role as any }, async(err:any, result:any) => {
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
    else role_data = role_data as RoleInterface[];
    // If the user somehows already is appart of the role, dont add him twice
    if(role_data[0]?.users.indexOf(user_id) === -1)
        return true;

    switch(action) {
        case 'add':
            // update the role in the database
            role_data[0].users = [...role_data[0]?.users, user_id];
            break;

        case 'remove':
            // remove the user id from the role
            role_data[0].users.splice(role_data[0].users.indexOf(user_id), 1);
            break;
    }

    // Update the role in the database
    return update(role, role_data[0], returnErrorKey);
}
