//TODO: this dosent work with multiple roles, it only works with one role.

// import { ObjectId } from "mongodb";
// import { ErrorInterface, RoleInterface, UserInterface } from "../../interfaces";
// import { get as get_role } from "./manageRole";
// import getUser from "../../user_service/src/get";
// import { locals, returnLocal } from "../../response_handler";

// /**
//  * Checks if a user has a permission
//  * 
//  * @param user UserInterface | ObjectId - the user to check, if it is an object id it will be fetched from the database, if it is a user object it will be used directly
//  * @param permission string - the permission to check
//  * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
//  * 
//  * @returns Promise<boolean | ErrorInterface> - if the user has the permission, returns true, if not returns false
// */
// export async function has(user: UserInterface | ObjectId, permission:string, returnError?: boolean):Promise<boolean | ErrorInterface>  {
//     return new Promise(async (resolve, reject) => {
//         let user_data:any = user,
//         permission_found = false;

//         if(user instanceof ObjectId)
//             user_data = await getUser(user);

//         //---------[ User not found ]---------//
//         if(!user_data?.permissions?.roles) {
//             if(returnError === true)
//                 return { 
//                     local_key: 'USER_NOT_FOUND',
//                     message: returnLocal(locals.KEYS.USER_NOT_FOUND)
//                 };

//             return false;
//         }

//         //---------[ User found ]---------//
//         for(let role in user_data.permissions.roles) {
//             // get the permissions of the role
//             let role_data = get(user_data.permissions.roles[role]);

//             // if the role is not found, continue
//             if(role_data instanceof Array)
//                 // check if the permission is in the role
//                 if(role_data.includes(permission))
//                     permission_found = true;
//         }

//         //---------[ return ]---------//
//         if(permission_found === false && returnError === true)
//             return { 
//                 local_key: 'PERMISSION_NOT_FOUND',
//                 message: returnLocal(locals.KEYS.PERMISSION_NOT_FOUND)
//             };

//         return permission_found;
//     });
// }

// /**
//  * 
//  * @param role ObjectId - the ObjectId of the role to get
//  * @param returnError boolean - if true, the error key will be returned, if false the output will be a boolean
//  * 
//  * @returns boolean | ErrorInterface | Array<string> - true if the role was deleted, false if it was not, if 'returnError' is true, the error key will be returned as a 'RoleError' obj,
//  *          if 'returnError' is false, the output will be an array of permissions
//  */
// export async function get(role: ObjectId, returnError?: boolean):Promise<Array<string> | ErrorInterface | boolean> {
//     let role_data = await get_role(role);

//     if(!role_data) {
//         if(returnError === true)
//             return { 
//                 local_key: 'ROLE_NOT_FOUND',
//                 message: returnLocal(locals.KEYS.ROLE_NOT_FOUND)
//             };

//         return false;
//     }

//     return (role_data as RoleInterface[])[0].permissions;
// }