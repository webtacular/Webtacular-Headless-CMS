import { ObjectId } from "mongodb";
import { ConfigInterface } from "..";
import { mongoDB } from "../../core/db_service";
import { ErrorInterface, GlobalRoleObject, RoleInterface } from "../../core/interfaces";
import logger from "../../core/logger";
import { locals, returnLocal } from "../../core/response_handler";

export default async(config: ConfigInterface, env: boolean): Promise<GlobalRoleObject | ErrorInterface> => {
    return new Promise(async(resolve, reject) => {
        // Get the global role object ID
        const globalRoleID: ObjectId = env ? config.global_objects.dev.role : config.global_objects.prod.role;

        // Construct the query
        const toBeFound:any = {
            _id: new ObjectId(globalRoleID),
        }

        // Make sure we are in the correct environment
        const collection: string = env ? config.collections.dev.config : config.collections.prod.config;

        // Get the global roles
        // TODO: Add a mongoDB.yml, cant use globals here.
        mongoDB.getClient(global.__MONGO_DB__, collection).findOne(toBeFound, (err: any, result: any) => {
            // Check if there was an error
            if(err) return reject({
                code: 0,
                local_key: locals.KEYS.DB_ERROR,
                message: returnLocal(locals.KEYS.DB_ERROR),
                where: 'init.globalRoleObject()',
            } as ErrorInterface);

            // Check if the global roles exist
            if(result) {
                logger.log({ message: `Global Role Object found`, level: 'info' });
                return resolve(result);
            } 
            
            // If the global roles do not exist, create it
            logger.log({ message: `Global Role Object NOT found, creating now.`, level: 'info' });

            // 
            // Create the Owner role.
            // 
            const ownerRole: RoleInterface = {
                _id: new ObjectId(),
                name: 'owner',
                description: 'The owner role',
                color: '#ff0000',
                core: true, // Core roles cannot be deleted, edited, or added to
                permissions: [
                    {
                        _id: new ObjectId(), //This is the permission id for owner
                        value: 0, 
                        locked: true // This means that this permission cannot be changed   
                    }
                ],
            }

            // 
            // Create the general role
            // 
            const generalRole: RoleInterface = {
                _id: new ObjectId(),
                name: 'user',
                description: 'This is the general role assigned to all users',
                color: '#00ff00',
                core: true, 
                permissions: [
                    {
                        _id: new ObjectId(), // Edit self        
                        value: 0,
                    },
                    {
                        _id: new ObjectId(), // View self
                        value: 0,
                        locked: true,
                    },
                    {
                        _id: new ObjectId(), // View other
                        value: 0,
                    }
                ],
            }

            // 
            // Construct the query
            //
            const toBeInserted:GlobalRoleObject = {
                _id: new ObjectId(globalRoleID),
                core_permissions: [
                    {
                        _id: ownerRole.permissions[0]._id,
                        name: 'admin',
                        description: 'This is the owner of the server',   
                    },
                    {
                        _id: generalRole.permissions[0]._id,
                        name: 'edit_self',  
                        description: 'This permission grants the user the ability to edit their own profile',
                    },
                    {   
                        _id: generalRole.permissions[1]._id,        
                        name: 'view_self',
                        description: 'This permission grants the user the ability to view their own profile',
                    },  
                    {   
                        _id: generalRole.permissions[2]._id,
                        name: 'view_other',
                        description: 'This permission grants the user the ability to view other users profiles',
                    },
                ],
                precedence: {
                    '-1': ownerRole._id, // -1 is the owner role
                    '0': generalRole._id, // 0 is the general role
                },
                roles: [ ownerRole, generalRole ],
                default_role: generalRole._id,
                owner_role: ownerRole._id,
            }

            // Create the global roles
            mongoDB.getClient(global.__MONGO_DB__, collection).insertOne(toBeInserted, (err: any, result: any) => {
                // Check if there was an error
                if(err) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: err,    
                    where: 'init.globalRoleObject()',
                } as ErrorInterface);

                // Return the global roles
                logger.log({ message: `Global Role Object created`, level: 'info' });
                return resolve(toBeInserted);
            });
        });
    });
}