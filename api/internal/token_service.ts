import { randomBytes } from "crypto";
import { ObjectId } from 'mongodb';
import { TokenInterface } from './interfaces';
import { httpErrorHandler, locals, mongoErrorHandler, returnLocal } from './response_handler';
import { getMongoDBclient } from './db_service';
import { compareHash, hashString } from "./hashing_service";
import { Cache } from 'memory-cache';
import { getTimeInSeconds } from "./general_services";

// this is the cache for the token service
export let token_cache:any = new Cache();

// this just returns an empty TokenInterface object
// its a function so that it cannot be changed
let emptyTokenObject = ():TokenInterface => {
    return { _id: new ObjectId(), user_id: '', timestamp: 0, admin: false, expired: true, authorized: false } as TokenInterface;
}

// As for anyone worrying about the admin variable, this dosent actualy give any premisions,
// its just there to tell the server that this is potentially an admin
// and it will do further checking to make sure that the user is an admin upon request

/**
 * This function is used add a new authentication token to the database.
 * 
 * @param userID string - the user's ID
 * @param ttl number - the time to live of the token in seconds, optional
 * @returns token string - the generated token
 */
export async function generateToken(userID:string, ttl:number = global.__SECURITY_OPTIONS__.token_expiration, admin:boolean = false):Promise<TokenInterface> {
    
    // Generate a cryptographically random enough token
    let raw_token = randomBytes(global.__SECURITY_OPTIONS__.token_lenght).toString('hex');

    // convert the seconds to milliseconds as thats what the memory-cache uses
    ttl = ttl * 1000;

    // hash the token
    let token = await hashString(raw_token, global.__SECURITY_OPTIONS__.token_salt_rounds),
        timestamp = getTimeInSeconds();

    // Object to be inserted in the database
    let toBeInserted:TokenInterface = {
        _id: new ObjectId(),
        token: token,
        user_id: userID,
        timestamp: timestamp,
        expiration: timestamp + ttl,
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
    

    // contain the raw token to be sent to the client
    let returnable:any = {
        combined: `${toBeInserted._id.toString()}.${raw_token}`
    }

    // clone the toBeInserted to avoid modifying the original object
    // which would effect the database by pushing the raw token to the database
    Object.assign(returnable, toBeInserted);


    // object that is to be put in the cache
    let toCache:any = { 
        _id: toBeInserted._id.toString(),
        combined: returnable.combined,
        admin: toBeInserted.admin,
        user_id: toBeInserted.user_id,
    }

    // if cacheing is enabled, push the token to cache
    if(global.__SECURITY_OPTIONS__.cache_tokens === true) 
        token_cache.put(toBeInserted._id.toString(), toCache, global.__SECURITY_OPTIONS__.token_cache_expiration);


    // Return the token data
    return returnable;
}

/**
 * This function is used to check if a token is valid.
 * 
 * @param token string - the token to check, must be in the format of 'id.token', where id is the token's id and token is the raw token itself
 * @returns userID string - the userID of the user that the token belongs to, undefined if the token is invalid
*/
export async function validateToken(token:string):Promise<TokenInterface> {

    // split the token into the id and unhashed token
    // 0 = id, 1 = unhashed token
    let tokenSplit = token.split('.');

    if(ObjectId.isValid(tokenSplit[0]) !== true)
        return emptyTokenObject();

    // Object to be found in the database
    let mongoDBfindOBJ:any = {
        _id: new ObjectId(tokenSplit[0]),
    }

    // Cretae a promise to return the token data
    return new Promise((resolve:any) => {

        // Get the database client and make the request
        getMongoDBclient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.token_collection).findOne(mongoDBfindOBJ, async(err:any, result:any) => {

            //TODO: Handle errors, and logging, dont want to do anything with loggin right now as I dont want to create another Log4J situation
            if(err) console.log(err);

            
            //---------[ Token is invalid ]---------//
            // If no token was found, return an empty object
            if(result === null)
                return resolve(emptyTokenObject());
            
            // check if the provided token is valid
            else if(await compareHash(tokenSplit[1], result.token) !== true) 
                return resolve(emptyTokenObject());

            // If the token was found, but is expired, return an empty object
            else if(result.expiration < getTimeInSeconds()){

                // remove the token from the database
                revokeToken(new ObjectId(result._id));

                // return an empty object
                return resolve(emptyTokenObject());
            }
            //--------------------------------------//

            
            //----------[ Token is valid ]----------//
            // if the token was found, return the token data and update the cache
            let toCache:any = {
                combined: token,
            };

            // assign the token data to the cache object, to avoid passing the raw token anywhere
            Object.assign(toCache, result);

            // refresh the cache
            refreshToken(toCache);
            
            return resolve(Object.assign(result, { expired: false, authorized: true }) as TokenInterface);
            //--------------------------------------//
        });
    });
}

/**
 * This function is used to remove a token from the database.
 * Provide the token _id NOT the token itself
 * 
 * @param token_id string - the token_id to be removed
 */
export async function revokeToken(token_id:ObjectId):Promise<boolean> {
    // make sure that the _id is valid, otherwise it will crash
    if(ObjectId.isValid(token_id) !== true)
        return false;

    // Object to be found in the database and removed
    let mongoDBfindOBJ:any = {
        _id: new ObjectId(token_id)
    }

    // Cretae a promise to return the token data
    return new Promise((resolve:any) => {

        // Get the database client and make the request
        getMongoDBclient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.token_collection).findOneAndDelete(mongoDBfindOBJ, async(err:any, result:any) => {

            //TODO: Handle errors, and logging, dont want to do anything with loggin right now as I dont want to create another Log4J situation
            if(err) console.log(err);
            
            // remove it from cache
            token_cache.del(token_id.toString());

            // If no token was removed, return false
            if(result === null)
                return resolve(false);

            // if the token was removed, return true
            resolve(true);
        });
    });
}

/**
 * This function is used to refresh a token.
 * 
 * @param tokenInfo TokenInterface - the token to be refreshed, must contain the combined token
 */
export function refreshToken(tokenInfo:TokenInterface):void {
    console.log(tokenInfo);
    // if the admin turned off token caching, dont do anything
    if(global.__SECURITY_OPTIONS__.cache_tokens !== true)   
        return;

    // we need the combined token to be able to continue
    if(tokenInfo?.combined === undefined)
        return;
        
    // first remove the token from the cache if its there
    token_cache.del(tokenInfo._id.toString());

    // object that is to be put in the cache
    let toCache:any = { 
        _id: tokenInfo._id.toString(),
        user_id: tokenInfo.user_id,
        combined: tokenInfo.combined,
        admin: tokenInfo.admin
    }

    // push the token to cache
    token_cache.put(tokenInfo._id.toString(), toCache, global.__SECURITY_OPTIONS__.token_cache_expiration);
}

/**
 * This function is used to check if the client provided a valid authentication token within the header or cookie of the request.
 * 
 * @param req any - the request object
 * @param res any - the response object
 * @param strict boolean - if true, a 401 unauthorized response will be sent if the token is invalid or not found, if false, the will be allowed to continue
 */
export async function checkForToken(req:any, res:any, strict:boolean = true, skipCache:boolean = false):Promise<boolean> {
    // this ensures that the there is data in the req.auth object
    req.auth = emptyTokenObject();

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
        return returnBool(() => httpErrorHandler(401, res, returnLocal(locals.KEYS.MISSING_TOKEN)), false);
    
    // I could just pass the empty token to the validateToken function, but I dont waste a db request that I know will be false
    else if(token === undefined)
        return false;
    //--------------------------------//


    //--------[ TOKEN CACHE ]--------// 
    // if the token is found in the cache, return the token data
    if(skipCache === false && global.__SECURITY_OPTIONS__.cache_tokens === true){

        // get the token from the cache
        let tokenCache = token_cache.get(token.split('.')[0]);

        // if the token is found in the cache, return the token data unless the user is an admin
        if(tokenCache !== undefined && tokenCache !== null && tokenCache?.admin !== true)
            return returnBool(() => { Object.assign(req.auth, tokenCache) }, true);

        // and if the token is not found in the cache, proceed to check the database and cache it
    }
    //-------------------------------//


    //--------[ TOKEN FOUND ]--------//
    // Now that we have a token, validate it
    let tokenData = await validateToken(token);

    // assign the token data to the req.auth object
    req.auth = tokenData;

    // If the token is invalid, return false
    if(tokenData.authorized !== true && strict === true)
        return returnBool(() => httpErrorHandler(401, res, returnLocal(locals.KEYS.INVALID_TOKEN)), false);

    else if(tokenData.user_id === undefined)
        return false;

    // If the token is expired, return false
    if(tokenData.expired === true && strict === true)
        return returnBool(() => httpErrorHandler(401, res, returnLocal(locals.KEYS.EXPIRED_TOKEN)), false);

    else if(tokenData.expired === true)
        return false;

    // If the user is not an admin, return true
    if(tokenData.admin !== true)
        return true
    //-------------------------------//


    //--------[ ADMIN REQUEST ]--------//
    // If the user is an admin, do further checks

    // Object to be found in the database
    let mongoDBfindOBJ:any = {
        _id: new ObjectId(tokenData.user_id),
    }

    // Cretae a promise to return the token data
    return new Promise((resolve:any) => {

        // Get the database client and make the request
        getMongoDBclient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.user_collection).findOne(mongoDBfindOBJ, (err:any, result:any) => {
            
            // if an error occured, pass it to the error handler
            if (err) return resolve(mongoErrorHandler(err.code, res, err.keyPattern));


            // if the user is an admin, return true
            if(result?.permissions?.admin === true || result?.permissions?.owner === true)
                return resolve(true);
            

            // If the user is not found or the token is invalid, return false and revoke the token
            revokeToken(tokenData._id);

            if(strict === true) return resolve(returnBool(() => httpErrorHandler(401, res, returnLocal(locals.KEYS.INVALID_TOKEN)), false));

            else return resolve(returnBool(() => { req.auth = emptyTokenObject() }, false));        
        });
    });
}