import { ObjectId } from "mongodb";
import { join } from "path";
import { ErrorInterface } from "../../interfaces";
import { locals, returnLocal } from "../../response_handler";
import { get as role_get } from "./manageRole";

const levelup = require('levelup'),
    leveldown = require('leveldown');

// Instantiate our db object
export let roleDB = levelup(leveldown(join(__dirname, '../datastore')));

export async function validateDB():Promise<void> {
    return new Promise(async(resolve) => {
        await roleDB.get('precedence', async(err: Error, value: string) => {
            if(err?.message.includes('Key not found')) resolve(await roleDB.put('precedence', JSON.stringify([])));
            else resolve();
        });    
    });
}

export async function set(id: ObjectId, precedence: number, returnError?:boolean): Promise<boolean | ErrorInterface | ObjectId[]> {
    return new Promise(async(resolve, reject) => {
        // Try get the role details
        let role:any = await role_get(id, { _id: 1, default: 1 });

        // Check if the role exists
        if(role[0] === undefined) {
            if(returnError === true) return reject({
                code: 1,
                local_key: locals.KEYS.NOT_FOUND,
                message: returnLocal(locals.KEYS.NOT_FOUND)
            } as ErrorInterface);
            
            return reject(false);
        }

        // Check if the role is the default role
        // the default role's precedence is 0, and it cannot be changed.
        if(role[0]?.default === true) {
            if(returnError === true) return reject({
                code: 1,
                local_key: locals.KEYS.DEFAULT_ROLE,
                message: returnLocal(locals.KEYS.DEFAULT_ROLE)
            } as ErrorInterface);
            
            return reject(false);
        }

        // floor the precedence
        precedence = Math.floor(precedence);

        // Check if the precedence is valid
        if(precedence < 1) {
            if(returnError === true) return reject({
                code: 1,
                local_key: locals.KEYS.ROLE_PRECEDENCE_NEGATIVE,
                message: returnLocal(locals.KEYS.ROLE_PRECEDENCE_NEGATIVE)  
            });

            return reject(false);
        }

        // get the current precedence
        let currentPrecedence = await get(true).catch(err => { throw Error(err.message) }) as ObjectId[];

        // the array is read left to right, on the left, the precedence is lower, on the right, the precedence is higher
        // 0 is reserved for the the default role, if you are familiar with CSS, think of this as the z-index
        //
        // 0         1            2       etc
        // ['user', 'moderator', 'admin']

        // Check if the precedence is already set, if it is, remove it
        currentPrecedence = currentPrecedence.filter((filter_id) => {
            return filter_id.toString() !== id.toString();
        });

        // Now add the precedence to the correct position
        currentPrecedence.splice(precedence, 0, new ObjectId(id));
        
        // Save the precedence
        await roleDB.put('precedence', JSON.stringify(currentPrecedence));

        // It worked, return true
        return currentPrecedence;
    });
}

/**
 * Get the precedences of the roles
 * 
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * @returns Promise<boolean | ErrorInterface | ObjectId[]> - returns the precedence, returns an ErrorInterface or boolean on error
 */
export async function get(returnError?:boolean): Promise<ObjectId[] | ErrorInterface | boolean> {    
    // fetch the precedences
    return new Promise((resolve:any, reject:any) => {
        roleDB.get('precedence', function (err:any, value:any) {

            // if there is an error, return the error
            if(err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: returnLocal(locals.KEYS.DB_ERROR),
                    where: 'role_service.managePrecedence.get'       
                } as ErrorInterface);
                
                return reject(false);
            }

            // Get the precedence data
            let currentPrecedence:string[] | ObjectId[] = JSON.parse(value.toString());

            // Make sure everything is an object id
            currentPrecedence = currentPrecedence.map(id => new ObjectId(id));

            // return the value
            return resolve(currentPrecedence as ObjectId[]);
        });
    });
}

export async function remove(id: ObjectId, returnError?:boolean): Promise<boolean | ErrorInterface | ObjectId[]> {
    return true;
}