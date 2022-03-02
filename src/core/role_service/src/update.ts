import { ObjectId } from "mongodb";
import { globalRoleObject } from "../../global_service";
import { ErrorInterface, GlobalRoleObject, RoleInterface, UpdateRoleInterface } from "../../interfaces";
import { locals, returnLocal } from "../../response_handler";

/**
 * This function is used to update a single role object.
 * 
 * @param id: ObjectId - The id of the role to be updated
 * @param update: UpdateRoleInterface - The object containing the updates
 * 
 * @returns Promise<ErrorInterface | RoleInterface >  
 */
export default async(id: ObjectId, update: UpdateRoleInterface, method:string): Promise<ErrorInterface | RoleInterface> => {
    return new Promise(async (resolve, reject) => {
        // Get the role object from the database
        let gro = (await globalRoleObject.get({
            roles: 1,
            core_permissions: 1,
            addon_permissions: 1,
        }).catch(reject) as GlobalRoleObject) as GlobalRoleObject,
            roles = gro.roles as Array<RoleInterface>;

        // Check if the role exists
        let role = roles.find(role => role._id.toString() === id.toString()),
            allPermissions = [...(gro.core_permissions || []), ...(gro.addon_permissions || [])];

        // If the role does not exist, return an error
        if(!role) return reject({
            code: 1,
            local_key: locals.KEYS.NOT_FOUND,
            message: returnLocal(locals.KEYS.NOT_FOUND),
        } as ErrorInterface);   

        // How are we updating the role?    
        switch(method) {
            case 'replace':

                // Create a new role object
                let new_role = {
                    _id: role._id,
                    core: role.core,
                    permissions: update?.permissions || [],
                    name: update?.name || role.name,
                    ...update
                } as RoleInterface;

                // Check what permissions are being updated
                // And if the user is removeing any core permissions
                for(let existingPermission in role.permissions) {
                    // Check if this existing permission is in
                    // the new role (onlyif its a core permission)
                    const perm = role.permissions[existingPermission]

                    // Check if the perm is a core permission
                    if(perm?.locked !== true) continue;

                    // Check if the permission is in the new role object
                    for(let newPermission in new_role.permissions) {
                        const newPerm = new_role.permissions[newPermission];

                        if(newPerm._id.toString() !== perm._id.toString()) continue;

                        // If the new_role contains the permission, remove it,
                        // as it is a core permission, and cannot be changed.
                        delete new_role.permissions[newPermission];
                    }

                    // Add the core permission to the new role object
                    new_role.permissions.push(perm);
                };

                // List to check for duplicates
                let check_list:Array<string> = [];            

                // Filter out any empty items in the permissions array,
                // And validate the permissions
                new_role.permissions = new_role.permissions.filter(perm => { 
                    // If the permission is empty, remove it
                    if(!perm) return false;

                    // Check if the permission is a duplicate
                    if(check_list.includes(perm._id.toString())) return reject({
                        code: 1,
                        local_key: locals.KEYS.DUPLICATE_PERMISSION,
                        message: returnLocal(locals.KEYS.DUPLICATE_PERMISSION),
                    } as ErrorInterface);

                    // Add the permission to the check list 
                    check_list.push(perm._id.toString());   

                    // If no value is set, set it to 2
                    if(perm.value > 2 || perm.value < 0) return reject({
                        code: 1,
                        local_key: locals.KEYS.INVALID_ROLE_PERMISSION_VALUE,
                        message: returnLocal(locals.KEYS.INVALID_ROLE_PERMISSION_VALUE),
                    } as ErrorInterface);

                    // If the role dosent have a locked property, set it to false       
                    if(!perm.locked) perm.locked = false;
                    
                    // Validate the permission
                    if(!allPermissions.find(groRole => groRole._id.toString() === perm._id.toString()))
                        return reject({
                            code: 1,
                            local_key: locals.KEYS.INVALID_ROLE_PERMISSION,
                            message: returnLocal(locals.KEYS.INVALID_ROLE_PERMISSION),
                        } as ErrorInterface);

                    // If its found, return true
                    return true;
                });
                
                // Update the global role object
                await globalRoleObject.set({
                    roles: roles.map(role => {
                        if(role._id.toString() === id.toString()) return new_role;
                        return role;
                    }),      
                }).catch(reject);

                // Return the role object
                return resolve(new_role);

            case 'add':
        }
    });
}