import { ObjectId } from "mongodb";
import { globalRoleObject } from "../../global_service";
import { mongoDB } from "../../db_service";
import { ErrorInterface, GlobalRoleObject, RoleInterface } from "../../interfaces";
import { role_name } from "../../regex_service";
import { locals, returnLocal } from "../../response_handler";
import editPrecedence from "./other/editPrecedence";

// Some notes:
// you may have noticed that we dont actually check if a role exists, we just assume it dosent
// as we dont allow the user/client to provide this function wiht an _id

export default async(object:{
    name:string,
    color?:string,
    description?:string,
    permissions: [{
        value: number, 
        _id: ObjectId
    }],
    precedence?: number
}): Promise<ErrorInterface | RoleInterface> => 
{
    return new Promise(async(resolve, reject) => {
        // Validate the role name
        if(!role_name.test(object.name)) return reject({
            code: 1,
            local_key: locals.KEYS.INVALID_ROLE_NAME,  
            message: returnLocal(locals.KEYS.INVALID_ROLE_NAME),
        } as ErrorInterface);
        

        // Check if the precedence was passed in, if not set it to 1
        // One higher than the default role
        if(!object?.precedence) object.precedence = 1;


        // Check if a description was passed in, if not set it to ''
        if(!object?.description) object.description = '';

        
        // Check if a color was passed in, if not set it to a grey     
        if(!object?.color) object.color = '3f3f3f'; 

        
        // Validate the precedence
        if(object.precedence < 1 || object.precedence % 1 !== 0) return reject({
            code: 1,
            local_key: locals.KEYS.INVALID_ROLE_PRECEDENCE,
            message: returnLocal(locals.KEYS.INVALID_ROLE_PRECEDENCE),
        });


        // Validate the permissions
        object.permissions.forEach(async(permission) => {
            // TODO: some validation function

            // Validate the value
            // 0: True
            // 1: Inherit
            // 2: False
            if(permission.value < 0 || permission.value > 2) return reject({
                code: 1,
                local_key: locals.KEYS.INVALID_ROLE_PERMISSION_VALUE,
                message: returnLocal(locals.KEYS.INVALID_ROLE_PERMISSION_VALUE),
            });
        });


        // Get the precedence before we delete it from the object
        let precedence = object.precedence;

        // Delete the precedence from the object
        delete object.precedence;

        // Assign an id to the object
        let query: RoleInterface = {
            ...object,  
            core: false,
            _id: new ObjectId(),
        };


        // Get the global role object, we will recycle this object
        // Saving a call to the database
        let gro = (await globalRoleObject.get({
            precedence: 1,
            roles: 1,
        }).catch(reject)) as GlobalRoleObject;

        // Add the new role to the global role object
        gro.roles.push(query)

        // Update the roles precedence
        editPrecedence({
            precedence: precedence,
            _id: query._id,
        }, gro).catch(reject);

        // Update the global role object
        await globalRoleObject.set(gro).catch(reject).then(() => {
            return resolve(query);
        });  
    });
}