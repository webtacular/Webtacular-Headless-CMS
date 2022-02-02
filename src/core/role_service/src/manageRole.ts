import { ErrorInterface, RoleInterface } from "../../interfaces";
import { mongoDB } from "../../db_service";
import { remove as user_remove } from "./manageUser";
import { ObjectId } from "mongodb";
import { locals, returnLocal } from "../../response_handler";
import { precedence } from "..";

/**
 * adds a role to the database
 * 
 * @param role RoleInterface - the role details to add
 * @param returnError boolean - if true, the error key will be returned, if false the output will be a boolean
 * 
 * @returns Promise <boolean | ErrorInterface | RoleInterface> - if the role was added a RoleInterface object will be returned, false if it was not, if 'returnError' is true, the error key will be returned as a 'RoleError' obj 
*/
export async function add(role:RoleInterface, returnError?:boolean):Promise<boolean | ErrorInterface | RoleInterface> {
    return new Promise((resolve:any, reject:any) => {
        // floor the precedence
        role.precedence = Math.floor(role.precedence);

        // validate the presence of the role, cant be 0 as that is the default role
        if(role.precedence < 1) {
            if(returnError === true) return reject({
                code: 1,    
                local_key: locals.KEYS.INVALID_PRECEDENCE,
                message: returnLocal(locals.KEYS.ROLE_PRECEDENCE_NEGATIVE),
            });

            return reject (false);
        }

        // make sure that this is not the default role
        role.default = false;

        // remove the precedence from the role,
        // we need to cast role as any because the interface requires the precedence to be there
        // whilst we only want it so we can pass it to a different function
        delete ((role as any).precedence);


        // Push the role to the database
        let mongoDBpushOBJ:any = {
            _id: new ObjectId(),
        }

        // merge the role object into the mongoDBpushOBJ
        Object.assign(mongoDBpushOBJ, role);

        // push the role to the database
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.role_collection).insertOne(mongoDBpushOBJ, async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if(err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: returnLocal(locals.KEYS.DB_ERROR),
                    where: 'role_service.manageRole.add()'
                } as ErrorInterface);
                
                return reject(false);
            }
            
            let precedence_response = await precedence.set(mongoDBpushOBJ._id, role.precedence).catch(err => {});

            // If the precedence service throws an error, delete the role from the database and throw the error
            if((precedence_response as ObjectId[])?.includes(mongoDBpushOBJ._id) === false) {
                await remove(mongoDBpushOBJ._id, returnError);
                
                if(returnError === true) return reject({
                    local_key: locals.KEYS.DB_ERROR,        
                    where: 'manageRole.ts',
                    message: (precedence_response as ErrorInterface).message
                } as ErrorInterface);

                return reject(false);
            }

            // If we successfully added the role, return true
            resolve(mongoDBpushOBJ as RoleInterface);
        });
    });
}

/**
 * fetches a role from the database
 * 
 * @param role ObjectId | ObjectId[] - the ObjectId(s) of the role(s) to fetch
 * 
 * @returns Promise <RoleInterface[]> - if the role(s) were found, a RoleInterface object will be returned
*/
export async function get(role:ObjectId | ObjectId[], filter?:any):Promise<RoleInterface[]> {
    return new Promise((resolve:any) => {
        // check if the user_id is an array, if not, make it an array
        if((role as ObjectId[])?.length === undefined)
        role = [role] as ObjectId[];

        // make sure the user_id is an array of ObjectIds type
        else role = role as ObjectId[];

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
        return resolve(mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.role_collection).aggregate(mask).toArray() as Promise<RoleInterface[]>);
    });
}

/**
 * deletes a role from the database
 * 
 * @param role_name string - the name of the role to delete
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * 
 * @returns Promise <boolean | ErrorInterface> - if the role was deleted, true will be returned, if not, if 'returnError' is true, the error key will be returned as a 'RoleError' obj
*/
export async function remove(role:ObjectId, returnError?:boolean):Promise<boolean | ErrorInterface> {
    return new Promise(async(resolve:any, reject:any) => {
        // find the role in the database
        let role_info = await get(role);

        //----[ if the role does not exist ]----//
        if(role_info[0] === undefined){
            if(returnError === true) return reject({ 
                code: 1,
                local_key: locals.KEYS.USER_NOT_FOUND,
                message: returnLocal(locals.KEYS.USER_NOT_FOUND)
            });

            return reject(false);
        }

        // Make sure that the role is the right type
        else role_info = role_info as RoleInterface[];

        // loop through the users that have the role, and remove the role from them
        for(let user of role_info[0].users) {
            await user_remove(user, role).catch(() => {});
        }

        // The object to find in the database
        let mongoDBremoveOBJ:any = {
            _id: role
        }

        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.role_collection).findOneAndDelete(mongoDBremoveOBJ, async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if (err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    where: 'manageRole.ts',
                    message: err.message
                } as ErrorInterface);

                return reject(false);
            }
            
            // If we successfully removed the role, return true
            return resolve(true);
        });
    });
}

/**
 * updates a role in the database
 * 
 * @param role ObjectId - the ObjectId of the role to update
 * @param new_role RoleInterface - the new role details
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * 
 * @returns Promise <boolean | ErrorInterface> - if the role was updated, true will be returned, if not, if 'returnError' is true, the error key will be returned as a 'RoleError' obj
 */
export async function update(role:ObjectId, new_role:RoleInterface, returnError?:boolean):Promise<boolean | ErrorInterface> {
    return new Promise((resolve, reject) => {
        //TODO: FIx this validateRole function

        // The object to find in the database
        let mongoDBupdateOBJ:any = {
            _id: role
        }

        // Try and update the role in the database
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.role_collection).findOneAndUpdate(mongoDBupdateOBJ, { $set: new_role as any }, async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if(err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: returnLocal(locals.KEYS.DB_ERROR),
                    where: 'role_service.manageRole.update()'       
                } as ErrorInterface);
                
                return reject(false);
            }

            // If no token was removed, return false
            if(!result) {
                if(returnError === true) return reject({
                    code: 1,
                    local_key: locals.KEYS.NOT_FOUND,
                    message: returnLocal(locals.KEYS.NOT_FOUND)
                } as ErrorInterface);
                
                return reject(false);
            }
            
            // If we successfully removed the role, return true
            return resolve(result);
        });
    });
}

/**
 * adds a user id to a role
 * 
 * @param role ObjectId - the ObjectId of the role to update
 * @param user_id ObjectId - the id of the user to add
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * 
 * @returns Promise<boolean | ErrorInterface> - true if the role was deleted, false if it was not, if 'returnError' is true, the error key will be returned as a 'RoleError' obj
 */
export async function addID(role:ObjectId, user_id:ObjectId, returnError?:boolean):Promise<boolean | ErrorInterface> {
    return modifyID(role, user_id, 'add', returnError);
}

/**
 *  removes a user id from a role
 * 
 * @param role ObjectId - the ObjectId of the role to update
 * @param user_id ObjectId - the id of the user to remove
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * 
 * @returns Promise<boolean | ErrorInterface> - true if the role was deleted, false if it was not, if 'returnError' is true, the error key will be returned as a 'RoleError' obj */
export async function removeID(role:ObjectId, user_id:ObjectId, returnError?:boolean):Promise<boolean | ErrorInterface> {
    return modifyID(role, user_id, 'remove', returnError);
}

async function modifyID(role:ObjectId, user_id:ObjectId, action:string, returnError?:boolean):Promise<boolean | ErrorInterface> {
    return new Promise(async(resolve, reject) => {
        
        // find the role in the database
        let role_data = await get(role) as RoleInterface[];

        //----[ if the role does not exist ]----//
        if(role_data[0] === undefined) {
            if(returnError === true) return reject({
                code: 1,
                local_key: locals.KEYS.NOT_FOUND,
                message: returnLocal(locals.KEYS.NOT_FOUND)
            } as ErrorInterface);
            
            return reject(false);
        }

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
        update(role, role_data[0], returnError).then(resolve).catch(reject);
    }); 
}
