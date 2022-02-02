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
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * @returns Promise<UserGetInterface[] | boolean | ErrorInterface> - The user object array or the error key
*/
export async function get(user: UserInterface | ObjectId, returnError?:boolean):Promise<RoleInterface[] | ErrorInterface | boolean> {
    return new Promise(async (resolve, reject) => {
        let user_data:any = user;

        if(user instanceof ObjectId)
            user_data = await getUser(user, true);

        //---------[ User not found ]---------//
        if(!user_data[0]?.permissions?.roles) {
            if(returnError === true) return reject({ 
                code: 1,
                local_key: locals.KEYS.USER_NOT_FOUND,
                message: returnLocal(locals.KEYS.USER_NOT_FOUND)
            });

            return reject(false);
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
        return resolve;
    });
}

/**
 * Checks if a user has a role
 * 
 * @param user UserInterface | ObjectId - the user to check, if it is an object id it will be fetched from the database, if it is a user object it will be used directly
 * @param roles ObjectId[] | ObjectId - The ID(s) of the roles to check
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * 
 * @returns Promise<{ [key: string]: boolean }  |boolean | ErrorInterface> - The user object array or the error key
*/
export async function has(user: UserInterface | ObjectId, roles:ObjectId[] | ObjectId, returnError?:boolean):Promise<{ [key: string]: boolean } | ErrorInterface | boolean> {
    return new Promise(async (resolve, reject) => {
        // Create an empty variable to store the roles
        let data:any;

        // Check if roles is an array or an object id
        if(roles instanceof Array === false)
            roles = [roles] as ObjectId[];

        // Make sure the roles are an array of object ids
        roles = roles as ObjectId[];


        // If we pass an object id, fetch the user
        if(user instanceof ObjectId)
            data = await user_service.get(user, { permissions: 1 })

        // If we pass a user object, use it
        else data = [user];

        // Make sure everything is the right type
        data = data as UserGetInterface;

    
        // place the roles that the user has into this array
        let has_roles:{ [key: string]: boolean } = {};
        

        //---------[ User not found ]---------//
        if(!data[0]?.permissions?.roles) {
            if(returnError === true) return reject({ 
                code: 1,
                local_key: locals.KEYS.USER_NOT_FOUND,
                message: returnLocal(locals.KEYS.USER_NOT_FOUND)
            });

            return reject(false);
        }
        
        // Loop through the roles that the user has
        data[0].permissions.roles.forEach((has_role: ObjectId) => {

            // Loop through the roles that we want to check
            (roles as ObjectId[])?.forEach(role => {

                // If the user has the role, set the has_role to true
                if(has_role.toString() === role.toString())
                    Object.assign(has_roles, { [role.toString()]: true });

                // If the user does not have the role, set the has_role to false
                else Object.assign(has_roles, { [role.toString()]: false });
            });
        });


        return resolve(has_roles);
    });
}

/**
 * Adds a role to a user
 * 
 * @param user ObjectId - the user to add the role to, if it is an object id it will be fetched from the database, if it is a user object it will be used directly
 * @param role ObjectId - the role to add
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * 
 * @returns Promise<boolean | ErrorInterface> - true if the role was added, false if the role was not added, or the error object
*/
export async function add(user: ObjectId, role:ObjectId, returnError?:boolean):Promise<boolean | ErrorInterface> {
    return edit_data(user, role, 'add', returnError);
}

/**
 * Removes a role from a user
 * 
 * @param user ObjectId - the user to add the role to, if it is an object id it will be fetched from the database, if it is a user object it will be used directly
 * @param role ObjectId - the role to add
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * 
 * @returns Promise<boolean | ErrorInterface> - true if the role was removed, false if the role was not removed, or the error object
*/
export async function remove(user: ObjectId, role:ObjectId, returnError?:boolean):Promise<boolean | ErrorInterface> {
    return edit_data(user, role, 'remove', returnError);
}

async function edit_data(user: ObjectId, role:ObjectId, action:string, returnError?:boolean,):Promise<boolean | ErrorInterface> {
   return new Promise(async (resolve, reject) => { 
        // Get the user
        let user_data = await user_service.get(user, { permissions: 1 })

        //---------[ User not found ]---------//
        if(!user_data[0]?.permissions?.roles) {
            if(returnError === true) return reject({ 
                code: 1,
                local_key: locals.KEYS.USER_NOT_FOUND,
                message: returnLocal(locals.KEYS.USER_NOT_FOUND)
            });

            return reject(false);
        }

        //---------[ Find the role ]---------//
        await get_role(role).catch((err) => { return reject(err) });
        
        // Get the roles that the user has
        let role_array:Array<ObjectId> = [...user_data[0]?.permissions?.roles];

        // check if the user has the role
        let string_array = role_array.map(role => role.toString()),
            hasRole = string_array.includes(role.toString());
        
        // check if the user already has the role
        switch(action) {
            case 'add':
                if(hasRole === true)
                    return resolve(true);

                // Add the role to the user
                role_array.push(role);

                // Update the role user id's
                let addRes:boolean | ErrorInterface = await addID(role, user, returnError);

                // add the role to the user
                if ((addRes as ErrorInterface)?.local_key !== undefined)
                    return addRes;

                break;

            case 'remove':
                if(hasRole === false)
                    return resolve(true);

                // Remove the role from the user
                role_array = role_array.filter(arr_role => arr_role?.toString() !== role?.toString());

                // Update the role user id's
                await removeID(role, user, returnError);

                break;
        }

        // create an object to store the new roles
        let role_data:any = { permissions: { roles: role_array } };
        
        // update the user
        await userDB.update(user, role_data, true).catch((err) => { return reject(err) });

        // Return true
        return resolve(true);
   });
}