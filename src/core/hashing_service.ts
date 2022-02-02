import bcrypt from 'bcrypt';
import { ErrorInterface } from './interfaces';
import {locals, returnLocal} from './response_handler';

/**
 * 
 * @param string string - the string to hash
 * @param salt_rounds number - the number of rounds to use for hashing
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * @returns Promise<string> - a promise that resolves to the hashed string
 */
export async function hashString(string:string, salt_rounds:number, returnError?:boolean):Promise<string | ErrorInterface | boolean> {
    return new Promise((resolve, reject) => {
        let throwError = (error:any):any => {
            if(returnError === true) return reject({
                code: 0,
                local_key: locals.KEYS.DB_ERROR,
                message: error.message,
                where: 'user_service.hashString()',
            });

            else return reject(false);
        }

        if(byteSize(string) > 75) {
            if(returnError === true) return reject({
                code: 1,
                local_key: locals.KEYS.STRING_TOO_LONG,
                message: returnLocal(locals.KEYS.STRING_TOO_LONG),
            });

            else return reject(false);
        }
    
        bcrypt.genSalt(salt_rounds, (error:any, salt:string) => {
            if(error) throwError(error);

            bcrypt.hash(string, salt, (error:any, hash:string) => 
                error ? throwError(error) : resolve(hash));
        }); 
    });
}

/**
 * This function is used to compare a string to a hash
 *  
 @param string string - the password to compare
 @param hash string - the hash to compare the password to
 @returns Promise<boolean> - a promise that resolves to true if the password matches the hash, false otherwise
**/
export async function compareHash(string:string, hash:string):Promise<boolean> {
    return bcrypt.compare(string, hash);
}

/**
 * This function is used to get the byte size of a string
 * 
 * @param input string - the input to check the size of
 * @returns number - the byte size of the input
 */
export function byteSize(input:string):number {
    return Buffer.byteLength(input, 'utf8');
}