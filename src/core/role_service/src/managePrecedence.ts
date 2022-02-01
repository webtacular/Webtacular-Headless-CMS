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

export async function set(id: ObjectId, precedence: number, returnErrorKey?:boolean): Promise<boolean | ErrorInterface> {
    // Try get the role details
    let role:any = await role_get(id, { _id: 1, default: 1 }, returnErrorKey);

    // Check if the role exists
    if(role[0] === undefined) {
        if(returnErrorKey === true) return {
            local_key: 'ROLE_NOT_FOUND',
            message: returnLocal(locals.KEYS.ROLE_NOT_FOUND)
        }

        return false;
    }

    // Check if the role is the default role
    // the default role's precedence is 0, and it cannot be changed.
    if(role[0].default === true) {
        if(returnErrorKey === true) return {
            local_key: 'ROLE_DEFAULT',
            message: returnLocal(locals.KEYS.ROLE_DEFAULT),
        }

        return false;
    }

    // floor the precedence
    precedence = Math.floor(precedence);

    // Check if the precedence is valid
    if(precedence < 1) {
        if(returnErrorKey === true) return {
            local_key: 'ROLE_PRECEDENCE_NEGATIVE',
            message: returnLocal(locals.KEYS.ROLE_PRECEDENCE_NEGATIVE)  
        }

        return false;
    }

    // get the current precedence
    let currentPrecedence = await get(true).catch(err => {throw Error(err.message)});

    // Make sure the precedence is the right type
    currentPrecedence = currentPrecedence as ObjectId[];

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
    currentPrecedence.splice(precedence, 0, id);
    
    // Save the precedence
    await roleDB.put('precedence', JSON.stringify(currentPrecedence));

    // It worked, return true
    return true;
}

// get the current precedence
export async function get(returnErrorKey?:boolean): Promise<ObjectId[] | ErrorInterface | boolean> {    
    // fetch the precedences
    return new Promise((resolve:any, reject:any) => {
        roleDB.get('precedence', function (err:any, value:any) {

            // if there is an error, return the error
            if (err) {
                if(returnErrorKey === true) return reject({
                    local_key: 'DB_ERROR',
                    message: err,
                    where: 'managePrecedence.get'
                } as ErrorInterface);

                return reject(false);
            }

            // return the value
            return resolve(JSON.parse(value.toString()));
        });
    });
}