import {ErrorInterface} from "./interfaces";

/**
 * Gets the time in seconds since epoch
 * 
 * @returns number - the number of seconds since the Unix Epoch
 */
export let getTimeInSeconds = ():number => Math.floor(Date.now() / 1000);

export let handleError = (err:ErrorInterface):void => {
    if(err.code == 2) return;

    throw new Error(JSON.stringify(err));     
}

/**
 * Stops me from having to do query.set() a million times, provide this function an object
 * and it will set the query parameters for you.
 * 
 * @param obj: {[key:string]:string} - the object containing the serach query parameters
 * @param query: URLSearchParams - the query 
 * 
 * @returns URLSearchParams 
**/
export let setUrlQuery = (obj: {[key:string]:string}, query:URLSearchParams):URLSearchParams => {
    for(let key in obj) {
        query.set(key, obj[key]);
    }
    
    return query;
}