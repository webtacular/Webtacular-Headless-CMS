import {randomBytes} from "crypto";
import { getRedisDBclient } from "./db_service";
import { httpErrorHandler, locals, returnLocal } from "./response_handler";

/**
 * This function is used add a new authentication token to the database.
 * 
 * @param userID string - the user's ID
 * @param ttl number - the time to live of the token in ms, optional
 * @returns token string - the generated token
 */
export function generateToken(userID:string, ttl?:number):string {
    // Generate a random token
    let token = randomBytes(global.__SECURITY_OPTIONS__.token_lenght).toString('hex');

    // Since we generate a token with a non asychronous function,
    // we can return it right away, and not wait for the database to be connected
    // to add it to the database.
    (async() => {
        // Get the database client
        const client = await getRedisDBclient(global.__DEF_REDIS_DB__);

        // If a ttl is not provided, use the default
        if(!ttl) ttl = global.__SECURITY_OPTIONS__.token_expiration;

        // Set the token in the database
        client.set(token, userID, 'EX', ttl);
        
        // disconnect the client
        client.quit();
    })();

    // Return the token
    return token;
}

export async function validateToken(token:string):Promise<string | boolean> {
    // Get the database client
    const client = await getRedisDBclient(global.__DEF_REDIS_DB__);

    // Get the userID from the token
    const userID = client.get(token);

    // If the userID is not defined, return false
    if(!userID) return false;

    // disconnect the client
    client.quit();

    // Return the userID
    return userID;
}

export async function revokeToken(token:string) {
    // Get the database client
    const client = await getRedisDBclient(global.__DEF_REDIS_DB__);

    // Delete the token
    client.del(token);

    // disconnect the client
    client.quit();
}

//TODO: make an acutal check for admin tokens
export async function checkForToken(req:any, res:any, strict:boolean = true):Promise<any> {
    // Authenticate the request for normal users //
    let user_check = async(token:string) => {
        // Get the userID from the token
        const userID = await validateToken(token);

        // If the userID is not defined, return a 401
        if(!userID && strict === true)
            return httpErrorHandler(401, res, returnLocal(locals.KEYS.MISSING_TOKEN));

        else if (!token) 
            return req.auth = { userID: '', token: '', authorized: false };

        // Set the userID in the request
        req.auth = {
            userID: userID,
            token: token,
            authorized: true,
            admin: false
        }
    }; // END //

    // Authenticate the request for admin users //
    let admin_check = async(token:string) => {
        // Get the userID from the token
        const userID = await validateToken(token);

         // Set the userID in the request
         req.auth = {
            userID: userID,
            token: token,
            authorized: true,
            admin: true
        }
    } // END //

    // Get the token from the request
    const token = req.headers.authorization === undefined ? req.cookies.token : req.headers.authorization;

    // If the token is not defined, return a 401
    if(!token && strict === true) 
        return httpErrorHandler(401, res, returnLocal(locals.KEYS.MISSING_TOKEN));

    else if (!token)
        return req.auth = { userID: '', token: '', authorized: false };

    // check which type of user is trying to authenticate
    let token_split = token.split(' ');

    if(token_split[0] === 'admin') // admin user
        return admin_check(token_split[1]);

    if(token_split[0] === 'user') // normal user
        return user_check(token_split[1]);

    // If the token dosent match any of the above, return a 401
    if(strict === true) 
        return httpErrorHandler(401, res, returnLocal(locals.KEYS.INVALID_TOKEN));

    else {
        req.auth = { userID: '', token: '', authorized: false };
        return;
    }
}