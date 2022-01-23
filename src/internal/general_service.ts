/**
 * Gets the time in seconds since epoch
 * 
 * @returns number - the number of seconds since the Unix Epoch
 */
export let getTimeInSeconds = ():number => Math.floor(Date.now() / 1000);
