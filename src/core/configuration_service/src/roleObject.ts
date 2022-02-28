import { mongoDB } from "../../db_service";
import { ErrorInterface, GlobalRoleObjectInterface } from "../../interfaces";
import { locals } from "../../response_handler";

export const firstTimeSetup = async(): Promise<ErrorInterface | GlobalRoleObjectInterface> => {
    return new Promise(async(resolve, reject) => {
        
    });
}

// export const get = async(): Promise<GlobalRoleObjectInterface | ErrorInterface> => {
//     return new Promise(async(resolve, reject) => {
//         // Construct the query
//         const query:any = {

//         }

//         // Get the global roles
//         mongoDB.getClient(global.__MONGO_DB__, global.__COLLECTIONS__.config).findOne({}, (err: any, result: any) => {});

//         // Check if the global roles exist
//         if(global_roles === null || global_roles === undefined) {
//             return reject({
//                 code: 1,
//                 local_key: locals.KEYS.GLOBAL_ROLES_NOT_FOUND,
//                 where: 'get.ts',
//                 message: `The global roles could not be found`
//             } as ErrorInterface);
//         }

//         // Return the global roles
//         return resolve(global_roles);
//     });
// }