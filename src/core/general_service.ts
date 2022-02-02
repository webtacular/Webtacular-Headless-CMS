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