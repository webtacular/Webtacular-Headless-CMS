import bcrypt from 'bcrypt';
import { httpErrorHandler } from '../public/response_handler';

/**
 * 
 * @param password string - the password to hash
 * @param res any - the response object, optional
 * @returns Promise<string> - a promise that resolves to the hashed password
 */
export async function hashPassword(password:string, res?:any):Promise<string> {
    let throwError = (error:any):void => {
        if(res) httpErrorHandler(500, res, error.message);
        else throw error;
    }

    if(byteSize(password) > 75) throwError('Password is too long');

    return new Promise((resolve) => {
        bcrypt.genSalt(global.__SALT_ROUNDS__, (error, salt:string) => {
            if(error) throwError(error);

            bcrypt.hash(password, salt, (error, hash:string) => 
                error ? throwError(error) : resolve(hash));
        }); 
    });
}

/**
 * This function is used to compare a password to a hash
 *  
 @param password string - the password to compare
 @param hash string - the hash to compare the password to
 @returns Promise<boolean> - a promise that resolves to true if the password matches the hash, false otherwise
**/
export async function comparePassword(password:string, hash:string):Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function byteSize(input:string):number {
    return Buffer.byteLength(input, 'utf8');
}