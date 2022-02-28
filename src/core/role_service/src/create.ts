import { ObjectId } from "mongodb";
import { mongoDB } from "../../db_service";
import { ErrorInterface, RoleInterface } from "../../interfaces";
import { role_name } from "../../regex_service";
import { locals, returnLocal } from "../../response_handler";

export default async(object:{
    name:string,
    color:string,
    permissions: [{
        value: number, 
        _id:ObjectId 
    }],
    precedence: number
}): Promise<ErrorInterface | RoleInterface> => {
    // TODO: Validate all the permissions, currently we
    // havent made a permission handler.

    // TODO: Add the precende nce to the Global Role Object
    // TODO: Announce the role to the Global Role Object

    return new Promise(async(resolve, reject) => {
        // Validate the role name
        if(!role_name.test(object.name)) return reject({
            code: 1,
            local_key: locals.KEYS.INVALID_ROLE_NAME,  
            message: returnLocal(locals.KEYS.INVALID_ROLE_NAME),
        } as ErrorInterface);

        // Validate the precedence
        if(object.precedence < 1) return reject({
            code: 1,
            local_key: locals.KEYS.INVALID_ROLE_PRECEDENCE,
            message: returnLocal(locals.KEYS.INVALID_ROLE_PRECEDENCE),
        });

        // Validate the permissions
        object.permissions.forEach(async(permission) => {
            // TODO: some validation function

            // Validate the value
            // 0: True
            // 1: False
            // 2: None
            if(permission.value < 0 || permission.value > 2) return reject({
                code: 1,
                local_key: locals.KEYS.INVALID_ROLE_PERMISSION_VALUE,
                message: returnLocal(locals.KEYS.INVALID_ROLE_PERMISSION_VALUE),
            });
        });
        
        // Construct the object to be inserted into the database
        const toBeInserted:any = {
            name: object.name,
            permissions: object.permissions,
        }

        // Add the role to the database
        mongoDB.getClient(global.__MONGO_DB__, global.__COLLECTIONS__.role).insertOne(toBeInserted, (err:any, result:any) => {
            // Check if there was an error
            if (err) return reject({
                code: 0,
                local_key: locals.KEYS.DB_ERROR,
                message: err.message,
                where: 'role_serive.create()',
            } as ErrorInterface);

            // Delete the precendence from the object 
            // as RoleInterface does not have it
            delete (object as any).precedence; 

            // Add the _id to the object
            (object as any)._id = result.insertedId; 

            // Return the role  
            resolve(object as any);
        });
    });
}