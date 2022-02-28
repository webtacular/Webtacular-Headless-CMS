import { randomBytes } from "crypto";
import { ObjectId } from 'mongodb';
import { ErrorInterface, TokenInterface } from './interfaces';
import { locals, returnLocal } from './response_handler';
import { mongoDB } from './db_service';
import { compareHash, hashString } from "./hashing_service";
import { Cache } from 'memory-cache';
import { getTimeInSeconds, handleError } from "./general_service";

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
 * @param userID ObjectId - the user's ID
 * @param ttl number - the time to live of the token in seconds, optional
 * @param admin boolean - if true, the user is an admin, optional   
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * @returns Promise<TokenInterface | boolean | ErrorInterface> - if true, the token is added to the database, if false, the token is not added to the database
 */
export async function generateToken(userID:ObjectId, ttl:number = global.__SECURITY_OPTIONS__.security.token_length, admin:boolean = false, returnError?:boolean):Promise<TokenInterface | ErrorInterface | boolean> {
    return new Promise(async (resolve, reject) => {
        
        // Generate a cryptographically random enough token
        let raw_token = randomBytes(global.__SECURITY_OPTIONS__.security.token_length).toString('hex');

        // hash the token
        let token = await hashString(raw_token, global.__SECURITY_OPTIONS__.security.token_salt_rounds),
            timestamp = getTimeInSeconds();

        // Object to be inserted in the database
        let toBeInserted:TokenInterface = {
            _id: new ObjectId(),
            token: token as string,
            user_id: userID,
            timestamp: timestamp,
            expiration: timestamp + ttl,
            admin
        }

        // Since we generate a token with a non asychronous function,
        // we can return it right away, and not wait for the database to be connected
        // to add it to the database.

        // Get the database client
        mongoDB.getClient(global.__MONGO_DB__, global.__COLLECTIONS__.token).insertOne(toBeInserted as any, (err:any, result:any) => {
            if(err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: returnLocal(locals.KEYS.DB_ERROR),
                    where: 'token_service.generateToken()',
                } as ErrorInterface);
                
                return reject(false);
            }

            // check if that user exists
            if (!result) {
                if(returnError === true) return reject({
                    local_key: locals.KEYS.NOT_FOUND,
                    code: 1,
                    where: 'token_service.ts',
                    message: returnLocal(locals.KEYS.NOT_FOUND)
                });

                return reject(false);
            }
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
        if(global.__SECURITY_OPTIONS__.security.token_cache === true) 
            token_cache.put(toBeInserted._id.toString(), toCache, global.__SECURITY_OPTIONS__.security.token_cache_ttl * 1000);


        // Return the token data
        return resolve(returnable);
    });
}

/**
 * This function is used to check if a token is valid.
 * 
 * @param token string - the token to check, must be in the format of 'id.token', where id is the token's id and token is the raw token itself
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * @returns Promise<TokenInterface | ErrorInterface | boolean> - the token data if the token is valid, false if the token is invalid, and an ErrorInterface object if returnError is true and the function errors
*/
export async function validateToken(token:string, returnError?:boolean):Promise<TokenInterface | ErrorInterface | boolean> {
    return new Promise(async (resolve, reject) => {
        // split the token into the id and unhashed token
        // 0 = id, 1 = unhashed token
        let tokenSplit = token.split('.');

        if(ObjectId.isValid(tokenSplit[0]) !== true) {
            if(returnError === true) return reject({
                code: 1,
                local_key: locals.KEYS.INVALID_TOKEN,
                message: returnLocal(locals.KEYS.INVALID_TOKEN)
            });

            return reject(false);
        }

        // Object to be found in the database
        let mongoDBfindOBJ:any = {
            _id: new ObjectId(tokenSplit[0]),
        }

        // Get the database client and make the request
        mongoDB.getClient(global.__MONGO_DB__, global.__COLLECTIONS__.token).findOne(mongoDBfindOBJ, async(err:any, result:any) => {
            if(err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: returnLocal(locals.KEYS.DB_ERROR),
                    where: 'token_service.validateToken()'                
                } as ErrorInterface);
                
                return reject(false);
            }
            
            //---------[ Token is invalid ]---------//
            // If no token was found, return an empty object
            if(result === null || await compareHash(tokenSplit[1], result.token) !== true) {
                if(returnError === true) return reject({
                    code: 1,
                    local_key: locals.KEYS.INVALID_TOKEN,
                    message: returnLocal(locals.KEYS.INVALID_TOKEN)
                });
    
                return reject(false);
            }

            // If the token was found, but is expired, return an empty object
            else if(result.expiration < getTimeInSeconds()){

                // remove the token from the database
                revokeToken(new ObjectId(result._id));

                // return an empty object
                if(returnError === true) return reject({
                    code: 1,
                    local_key: locals.KEYS.EXPIRED_TOKEN,
                    message: returnLocal(locals.KEYS.EXPIRED_TOKEN)
                });
    
                return reject(false);
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
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * @returns Promise<boolean | ErrorInterface> - if returnError is true, it will return an ErrorInterface object, if false, a boolean will be returned
*/
export async function revokeToken(token_id:ObjectId, returnError?:boolean):Promise<boolean | ErrorInterface> {
    // Cretae a promise to return the token data
    return new Promise((resolve, reject) => {
        // make sure that the _id is valid, otherwise it will crash
        if(ObjectId.isValid(token_id) !== true) {
            if(returnError === true) return reject({
                code: 1,
                local_key: locals.KEYS.INVALID_TOKEN,
                message: returnLocal(locals.KEYS.INVALID_TOKEN)
            });

            return reject(false);
        }

        // Object to be found in the database and removed
        let mongoDBfindOBJ:any = {
            _id: new ObjectId(token_id)
        }

        // Get the database client and make the request
        mongoDB.getClient(global.__MONGO_DB__, global.__COLLECTIONS__.token).findOneAndDelete(mongoDBfindOBJ, async(err:any, result:any) => {

            if(err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: returnLocal(locals.KEYS.DB_ERROR),
                    where: 'token_service.revokeToken()'                
                } as ErrorInterface);
                
                return reject(false);
            }
            
            // remove it from cache
            token_cache.del(token_id.toString());

            // If no token was removed, return false
            if(!result) {
                if(returnError === true) return reject({
                    code: 1,
                    local_key: locals.KEYS.NOT_FOUND,
                    message: returnLocal(locals.KEYS.NOT_FOUND)
                } as ErrorInterface);
                
                return reject(false);
            }

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

    // if the admin turned off token caching, dont do anything
    if(global.__SECURITY_OPTIONS__.security.token_cache !== true)   
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

    // push the token to cache, * 1000 because this package uses milliseconds and we use seconds
    token_cache.put(tokenInfo._id.toString(), toCache, global.__SECURITY_OPTIONS__.security.token_cache_ttl * 1000);
}

/**
 * This function is used to check if the client provided a valid authentication token within the header or cookie of the request.
 * 
 * @param req any - the request object
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * @param skipCache boolean - if false, the token will not be checked for in the cache
*/
export async function checkForToken(req:any, returnError?:boolean, skipCache:boolean = false):Promise<ErrorInterface | void> {

    // this ensures that the there is data in the req.auth object
    req.auth = emptyTokenObject();

    // make sure its the correct type
    req.auth = req.auth as TokenInterface;

    // returns a boolean while also executing a function
    let exec = (func:any) => {
        func();
        req.auth = req.auth as TokenInterface;
    };

    // Get the token from the header or cookie, inline if statment, 
    // if the auth header is undefined, check the cookie
    // else use the auth header
    const token = req?.headers?.authorization === undefined ? req?.cookies?.token : req?.headers?.authorization;

    //-------[ NO TOKEN FOUND ]-------//
    // If the token is undefined, return false
    if(token === undefined) {
        if(returnError === true) return {
            code: 1,
            local_key: 'MISSING_TOKEN',
            message: returnLocal(locals.KEYS.MISSING_TOKEN)
        }

        else return;
    }
    //--------------------------------//


    //--------[ TOKEN CACHE ]--------// 
    // if the token is found in the cache, return the token data
    if(skipCache === false && global.__SECURITY_OPTIONS__.security.token_cache === true){

        // get the token from the cache
        let tokenCache = token_cache.get(token.split('.')[0]);

        // if the token is found in the cache, return the token data unless the user is an admin
        if(tokenCache !== undefined && tokenCache !== null && tokenCache?.admin !== true)
            return exec(() => { Object.assign(req.auth, tokenCache) });

        // and if the token is not found in the cache, proceed to check the database and cache it
    }
    //-------------------------------//


    //--------[ TOKEN FOUND ]--------//
    // Now that we have a token, validate it
    let tokenData = await validateToken(token, true).catch(err => handleError(err));

    // If valid, return the token data
    tokenData = tokenData as TokenInterface;

    // assign the token data to the req.auth object
    req.auth = tokenData;

    // If the token is invalid, return false
    if(tokenData?.authorized !== true){
        if(returnError === true) return {
            code: 1,
            local_key: 'INVALID_TOKEN',
            message: returnLocal(locals.KEYS.INVALID_TOKEN)
        }

        else return;
    }

    // If the token is expired, return false
    if(tokenData.expired === true){
        if(returnError === true) return {
            code: 1,
            local_key: 'EXPIRED_TOKEN',
            message: returnLocal(locals.KEYS.EXPIRED_TOKEN)
        }

        else return;
    }

    // If the user is not an admin, return true
    if(tokenData.admin !== true)
        return;
    //-------------------------------//


    //TODO://--------[ ADMIN REQUEST ]--------//
    // If the user is an admin, do further checks

    // Cretae a promise to return the token data
 
    // let adminID:ObjectId = global.__GLOBAL_ROLE_IDS__.admin;

    // // Check if the user holds those roles
    // let userRoles = await user.has(new ObjectId(tokenData.user_id), adminID, true);

    // if((userRoles as { [key: string]: boolean })[adminID.toString()] === true)
    //     return resolve();

    // // If the user is not found or the token is invalid, return false and revoke the token
    // revokeToken(tokenData._id);

    // if(returnError === true) return resolve({
    //     local_key: 'INVALID_TOKEN',
    //     message: returnLocal(locals.KEYS.INVALID_TOKEN)
    // });

    // else return resolve();    
}