import {FastifyInstance} from "fastify";
import {ObjectId} from "mongodb";
import {ErrorInterface, TokenInterface} from "../../interfaces";
import {locals, returnLocal} from "../../response_handler";
import {generateToken} from "../../token_service";

/**
 * Authenticate a user
 * 
 * @param id - The id of the user to be authenticated
 * @param returnError - If true, the function will return an error object, else it will return a boolean if an error occured
 * @returns Promise<boolean | ErrorInterface | TokenInterface> - Returns a TokenInterface object for that user, else error.
 */
export async function authenticate(id:ObjectId, req:FastifyInstance, returnError?:boolean): Promise<boolean | ErrorInterface | TokenInterface> {
    return new Promise(async(resolve, reject) => {
        let token = await generateToken(id, undefined, false, true).catch((err:ErrorInterface) => {
            return reject(err);
        });
    });
}

/**
 * 
 * @param details 
 * @returns 
 */
export async function resolve(details: {
    id?: string | ObjectId;
    email?: string;
    username?: string;
    password?: string;
    token?: string;
}, returnError?:boolean): Promise<boolean | ErrorInterface | ObjectId> {
    return new Promise(async(resolve, reject) => {
        // Check if the user provided a token
        if(details?.token !== undefined) {

        }
        
        // If no token was provided, check if the user provided a password
        // as thats a necessary field for all other scenarios
        if(details?.password === undefined) {
            if(returnError === true) return reject({
                code: 1,
                local_key: locals.KEYS.INVALID_PASSWORD,
                message: returnLocal(locals.KEYS.INVALID_PASSWORD)
            });

            return reject(false);
        }
    });
}