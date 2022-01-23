import bcrypt from 'bcrypt';
import { httpErrorHandler } from './response_handler';

/**
 * 
 * @param string string - the string to hash
 * @param res any - the response object, optional
 * @returns Promise<string> - a promise that resolves to the hashed string
 */
export async function hashString(string:string, salt_rounds:number, res?:any):Promise<string> {
    let throwError = (error:any):void => {
        if(res) httpErrorHandler(500, res, error.message);
        else throw error;
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