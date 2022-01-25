import bcrypt from 'bcrypt';
import {ErrorInterface} from './interfaces';

/**
 * 
 * @param string string - the string to hash
 * @param salt_rounds number - the number of rounds to use for hashing
 * @param returnErrorKey boolean - if true, returns an error object, if false, returns a boolean
 * @returns Promise<string> - a promise that resolves to the hashed string
 */
export async function hashString(string:string, salt_rounds:number, returnErrorKey?:boolean):Promise<string | ErrorInterface> {
    let throwError = (error:any):ErrorInterface | string => {
        if(returnErrorKey === true) return {
            local_key: 'HASH_ERROR',
            message: error.message
        } as ErrorInterface;

        else return '';
    }

    if(byteSize(string) > 75) throwError('string is too long');

    return new Promise((resolve) => {
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
 * @returns 
 */
export function byteSize(input:string):number {
    return Buffer.byteLength(input, 'utf8');
}