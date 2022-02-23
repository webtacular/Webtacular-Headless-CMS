import { settings } from "../../..";
import axios from 'axios';
import { DiscordBearerInterface, DiscordOauth2Interface, DiscordUserInterface, ErrorInterface, isErrorInterface } from "../../interfaces";
import { locals, returnLocal } from "../../response_handler";
import { getTimeInSeconds, setUrlQuery } from "../../general_service";

// These are the discord enpoints, these are set in stone as if discord was to change their API,
// we'd need to change our code, so having these is a separate file is pointless.
const endpoints = {
    token: 'https://discord.com/api/oauth2/token',
    revoke: 'https://discord.com/api/oauth2/token/revoke',
    authorize: 'https://discord.com/api/oauth2/authorize',
    user: 'https://discord.com/api/users/@me',
};

// This is the defualt Oauth2 object
export let defualt = ():DiscordOauth2Interface => {
    return { 
        scopes: settings.api.oauth2.discord.scopes,
        client_secret: settings.api.oauth2.discord.client_secret, 
        client_id: settings.api.oauth2.discord.client_id,
        redirect_uri: settings.api.oauth2.discord.redirect_uri,
    }
}

const resolveBearerData = async(data:any): Promise<DiscordBearerInterface | ErrorInterface> => {
    return new Promise((resolve, reject) => {
        let throwErr = () => reject({ local_key : locals.KEYS.INVALID_RESPONSE_DISCORD, message: returnLocal(locals.KEYS.INVALID_RESPONSE_DISCORD), code: 0, where: 'auth_service.discord.resolveBearerData()'} as ErrorInterface);

        // if we have an error, throw it
        if(data?.error) return throwErr()

        // These are the keys we need to get from the discord response
        let required: Array<string | boolean> = ['access_token', 'refresh_token', 'expires_in', 'scope', 'token_type'];  

        // Check if all the required data is present
        required = required.map(key => key = Object.keys(data || {}).includes(key as string));

        // If we don't have all the required data, throw an error
        if(required.includes(false)) return throwErr();

        // change the expires_in to a timestamp
        data.expires_at = data.expires_in + Date.now();

        // combine the data for requests
        data.combined = `${data.token_type} ${data.access_token}`;

        // return the data  
        resolve(data);
    });
}

/**
 * This function returns a Discord Oauth2 authorization url that a user can use to authorize
 * 
 * @param authObj ?DiscordOauth2Interface - the object containing the discord oAuth2 information
 * @returns string - the discord oauth2 url
 */
export const url = (authObj?:DiscordOauth2Interface):string => {
    // If no auth object is provided, use the default
    if(!authObj) authObj = defualt();

    // Generate the URL
    let query = new URLSearchParams();

    // Set the query parameters
    query = setUrlQuery({
        response_type: 'code',
        client_id: authObj.client_id,
        redirect_uri: authObj.redirect_uri,
        scope: authObj.scopes.join(' '),
    }, query);

    // Return the URL
    return endpoints.authorize + '?' + query.toString();    
};

/**
 * This function returns the discord bearer token from the discord oauth2 response code
 * 
 * @param code string - the code that was returned from the discord oauth2 authorization url
 * @param authObj ?DiscordOauth2Interface - the object containing the discord oAuth2 information
 * @returns Promise<DiscordBearerInterface | ErrorInterface> - the discord bearer object
 */
export const authorize = async(code:string, authObj?:DiscordOauth2Interface):Promise<DiscordBearerInterface | ErrorInterface> => {
    return new Promise((resolve, reject) => {

        // If no auth object is provided, use the default
        if(!authObj) authObj = defualt();

        // Generate the URL
        let query = new URLSearchParams();

        // Set the query parameters
        query = setUrlQuery({
            client_id: authObj.client_id,   
            client_secret: authObj.client_secret,
            redirect_uri: authObj.redirect_uri,
            grant_type: 'authorization_code',   
            code: code, 
        }, query);

        // Make the request
        axios.post(endpoints.token, query).then((response:any) => 
            // Process the response
            resolveBearerData(response?.data).then((data:DiscordBearerInterface | ErrorInterface) => resolve(data as DiscordBearerInterface)).catch(reject)).catch((err:any) => {
            
            // This means that the user passed an invalid or expired code   
            if(err?.response?.data?.error_description == 'Invalid "code" in request.')
                return reject({ code: 1, local_key: locals.KEYS.INVALID_DISCORD_CODE, message: err.message, where: 'discord_oauth2.authorize()' } as ErrorInterface)

            // this is for any other error encountered
            return reject({ code: 0, local_key: locals.KEYS.UNKNOWN_ERROR, message: err.message, where: 'discord_oauth2.authorize()' } as ErrorInterface)
        });
    });
};

/**
 * This function returns the discord bearer token from the discord oauth2 refresh token
 * 
 * @param refreshToken string - the discord refresh token
 * @param authObj ?DiscordOauth2Interface - the object containing the discord oAuth2 information
 * @returns Promise<DiscordBearerInterface | ErrorInterface> - the discord bearer object
 */
export const refresh = async(refreshToken:string, authObj?:DiscordOauth2Interface):Promise<DiscordBearerInterface | ErrorInterface> => {
    return new Promise((resolve, reject) => {

        // If no auth object is provided, use the default
        if(!authObj) authObj = defualt();

        // Generate the URL
        let query = new URLSearchParams();

        // Set the query parameters
        query = setUrlQuery({
            client_id: authObj.client_id,   
            client_secret: authObj.client_secret,
            grant_type: 'refresh_token',   
            refresh_token: refreshToken, 
        }, query);

        // Make the request
        axios.post(endpoints.token, query).then((response:any) => 
            // Process the response
            resolveBearerData(response?.data).then((data:DiscordBearerInterface | ErrorInterface) => resolve(data as DiscordBearerInterface)).catch(reject)).catch((err:any) => {
             
            // This means that the user passed an invalid or expired code   
            if(err?.response?.data?.error == 'invalid_grant')
                return reject({ code: 1, local_key: locals.KEYS.INVALID_DISCORD_CODE, message: err.message, where: 'discord_oauth2.authorize()' } as ErrorInterface)

            // this is for any other error encountered
            return reject({ code: 0, local_key: locals.KEYS.UNKNOWN_ERROR, message: err.message, where: 'discord_oauth2.authorize()' } as ErrorInterface)
        });
    });
}

/**
 * This function returns the discord user data from the discord bearer token
 * 
 * @param token DiscordBearerInterface - the object containing discord bearer data
 * @returns Promise<DiscordUserInterface | ErrorInterface> - the discord user object    
*/
export const identity = async(token:DiscordBearerInterface): Promise<DiscordUserInterface | ErrorInterface> => {
    return new Promise((resolve, reject) => {
        // Did we get a token?
        if(!token?.combined) return reject({ code: 0, local_key: locals.KEYS.INVALID_DISCORD_TOKEN, message: 'No token provided', where: 'discord_oauth2.identity()' } as ErrorInterface);      

        // Build and Make the request
        axios.get(endpoints.user, { 
            headers: { Authorization: token.combined } 
        })

        // Process the response
        .then((response:any) => {
            console.log(response.data);
            return resolve(response.data);
        })

        // Process the error
        .catch((err:any) => {
            // This means that the user passed an invalid or expired code   
            if(err?.response?.data?.message == '401: Unauthorized')
                return reject({ code: 1, local_key: locals.KEYS.INVALID_DISCORD_CODE, message: err.message, where: 'discord_oauth2.authorize()' } as ErrorInterface)

            // this is for any other error encountered
            return reject({ code: 0, local_key: locals.KEYS.UNKNOWN_ERROR, message: err.message, where: 'discord_oauth2.getIdentify()' } as ErrorInterface);
        });
    });
}

/**
 * This function is used to revoke a token
 * 
 * @param token DiscordBearerInterface - the object containing discord bearer data  
 * @returns Promise<boolean | ErrorInterface> - true if the token was revoked, false if not
*/
export const revoke = async (token:DiscordBearerInterface): Promise<boolean | ErrorInterface> => {
    return new Promise((resolve, reject) => {
        // Did we get a token?
        if(!token?.combined) return reject({ code: 0, local_key: locals.KEYS.INVALID_DISCORD_TOKEN, message: 'No token provided', where: 'discord_oauth2.revoke()' } as ErrorInterface);      

        // Build and Make the request
        axios.post(endpoints.revoke, { 
            headers: { Authorization: token.combined } 
        })

        // Process the response
        .then(() => resolve(true))

        // Process the error
        .catch((err:any) => {
            // This means that the user passed an invalid or expired code   
            if(err?.response?.data?.message == '401: Unauthorized')
                return reject({ code: 1, local_key: locals.KEYS.INVALID_DISCORD_CODE, message: err.message, where: 'discord_oauth2.authorize()' } as ErrorInterface)

            // this is for any other error encountered
            return reject({ code: 0, local_key: locals.KEYS.UNKNOWN_ERROR, message: err.message, where: 'discord_oauth2.revoke()' } as ErrorInterface);
        });
    });
}