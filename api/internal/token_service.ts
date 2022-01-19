import {randomBytes} from "crypto";
import {ObjectId} from 'mongodb';
import {IpInterface, TokenInterface} from './interfaces';
import {httpErrorHandler, locals, mongoErrorHandler, returnLocal} from './response_handler';
import {getMongoDBclient} from './db_service';

// As for anyone worrying about the admin variable, this dosent actualy give any premisions,
// its just there to tell the server that this is potentially an admin
// and it will do further checking to make sure that the user is an admin upon request

/**
 * This function is used add a new authentication token to the database.
 * 
 * @param userID string - the user's ID
 * @param ttl number - the time to live of the token in ms, optional
 * @returns token string - the generated token
 */
export function generateToken(userID:string, ttl:number = global.__SECURITY_OPTIONS__.token_expiration, admin:boolean = false):TokenInterface {
    // Generate a cryptographically random enough token
    let token = randomBytes(global.__SECURITY_OPTIONS__.token_lenght).toString('hex');

    // Object to be inserted in the database
    let toBeInserted:TokenInterface = {
        token: token,
        user_id: userID,
        timestamp: Date.now(),
        expiration: Date.now() + ttl,
        admin
    }

    // Since we generate a token with a non asychronous function,
    // we can return it right away, and not wait for the database to be connected
    // to add it to the database.

    // Get the database client
    getMongoDBclient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.token_collection).insertOne(toBeInserted as any, (err:any, result:any) => {
        if(err) console.log(err);
        //TODO: Handle errors, and logging, dont want to do anything with loggin right now as I dont want to create another Log4J situation
    });

    // Return the token data
    return toBeInserted;
}

/**
 * This function is used to check if a token is valid.
 * 
 * @param token string - the token to check
 * @returns userID string - the userID of the user that the token belongs to, undefined if the token is invalid
*/
export async function validateToken(token:string):Promise<TokenInterface> {
    // Object to be found in the database
    let mongoDBfindOBJ:any = {
        token,
    }

    // Cretae a promise to return the token data
    return new Promise((resolve:any, reject:any) => {

        // Get the database client and make the request
        getMongoDBclient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.token_collection).findOne(mongoDBfindOBJ, (err:any, result:any) => {

            //TODO: Handle errors, and logging, dont want to do anything with loggin right now as I dont want to create another Log4J situation
            if(err) console.log(err);

            let emptyToken:TokenInterface = {
                _id: '',
                token: '',
                user_id: '',
                timestamp: 0,
                expiration: 0,
                admin: false,
                expired: true,
                authorized: false
            }
            
            // If no token was found, return an empty object
            if(result === null)
                resolve(emptyToken);

            // If the token was found, but is expired, return an empty object
            else if(result.expiration < Date.now())
                resolve(emptyToken);

            // if the token was found, return the token data
            resolve(Object.assign(result, { expired: false, authorized: true }) as TokenInterface);
        });
    });
}

/**
 * This function is used to remove a token from the database.
 * 
 * @param token string - the token to remove
 */
export async function revokeToken(token:string):Promise<boolean> {
    // Object to be found in the database and removed
    let mongoDBfindOBJ:any = {
        _id: new ObjectId(token),
    }

    // Cretae a promise to return the token data
    return new Promise((resolve:any, reject:any) => {

        // Get the database client and make the request
        getMongoDBclient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.token_collection).findOneAndDelete(mongoDBfindOBJ, (err:any, result:any) => {

            //TODO: Handle errors, and logging, dont want to do anything with loggin right now as I dont want to create another Log4J situation
            if(err) console.log(err);
            
            // If no token was removed, return false
            if(result === null) resolve(false);

            // if the token was removed, return true
            resolve(true);
        });
    });
}

/**
 * This function is used to check if the client provided a valid authentication token within the header or cookie of the request.
 * 
 * @param req any - the request object
 * @param res any - the response object
 * @param strict boolean - if true, a 401 unauthorized response will be sent if the token is invalid or not found, if false, the will be allowed to continue
 */
export async function checkForToken(req:any, res:any, strict:boolean = true):Promise<boolean> {

    // returns a boolean while also executing a function
    let returnBool = (func:any, bool:boolean) => {
        func();
        return bool;
    };

    // Get the token from the header or cookie, inline if statment, 
    // if the auth header is undefined, check the cookie
    // else use the auth header
    const token = req.headers.authorization === undefined ? req.cookies.token : req.headers.authorization;


    //-------[ NO TOKEN FOUND ]-------//
    // If the token is undefined, return false
    if(token === undefined && strict === true)
        return returnBool(httpErrorHandler(401, res, returnLocal(locals.KEYS.MISSING_TOKEN)), false);
    
    // I could just pass the empty token to the validateToken function, but I dont waste a db request that I know will be false
    else if(token === undefined)
        return returnBool(() => req.auth = { _id: '', user_id: '', timestamp: 0, admin: false, expired: true, authorized: false }, false);
    //--------------------------------//


    //--------[ TOKEN FOUND ]--------//
    // Now that we have a token, validate it
    let tokenData = await validateToken(token);

    // If the token is invalid, return false
    if(tokenData.user_id === undefined && strict === true)
        return returnBool(httpErrorHandler(401, res, returnLocal(locals.KEYS.INVALID_TOKEN)), false);

    else if(tokenData.user_id === undefined)
        return returnBool(() => { req.auth = tokenData }, false);

    // If the token is expired, return false
    if(tokenData.expired === true && strict === true)
        return returnBool(httpErrorHandler(401, res, returnLocal(locals.KEYS.EXPIRED_TOKEN)), false);

    else if(tokenData.expired === true)
        return returnBool(() => { req.auth = tokenData }, false);


    // If the user is not an admin, return true
    if(tokenData.admin !== true)
        return returnBool(() => { req.auth = tokenData }, true);
    //-------------------------------//


    //--------[ ADMIN REQUEST ]--------//
    // If the user is an admin, do further checks

    // Object to be found in the database
    let mongoDBfindOBJ:any = {
        _id: new ObjectId(tokenData.user_id),
    }

    // Cretae a promise to return the token data
    return new Promise((resolve:any, reject:any) => {

        // Get the database client and make the request
        getMongoDBclient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.token_collection).findOneAndDelete(mongoDBfindOBJ, (err:any, result:any) => {
            
            // if an error occured, pass it to the error handler
            if (err) return mongoErrorHandler(err.code, res, JSON.stringify(err.keyPattern));
            
            if(result?.permissions?.admin === true || result?.permissions?.owner === true) 
                return resolve(() => { req.auth = tokenData }, true);

            // If the user is not found or the token is invalid, return false and revoke the token
            
            //Revoke the token
            if(tokenData?._id !== undefined)
                revokeToken(tokenData._id.toString());

            if(strict === true) return resolve(returnBool(httpErrorHandler(401, res, returnLocal(locals.KEYS.INVALID_TOKEN)), false));

            else return returnBool(() => { req.auth = { _id: '', user_id: '', timestamp: 0, admin: false, expired: true, authorized: false } }, false);        
        });
    });
}