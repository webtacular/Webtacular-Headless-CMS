import { settings } from "../../../..";
import axios from 'axios';
import { ErrorInterface } from "../../../interfaces";
import { locals, returnLocal } from "../../../response_handler";
import { getTimeInSeconds } from "../../../general_service";

const endpoints = {
    token: 'https://discord.com/api/oauth2/token',
    revoke: 'https://discord.com/api/oauth2/token/revoke',
    authorize: 'https://discord.com/api/oauth2/authorize',
    user: 'https://discord.com/api/users/@me',
};

export interface DiscordOauth2Interface {
    client_id: string;
    client_secret: string;      
    redirect_uri: string;
    scopes: string[];
}

export interface DiscordBearerInterface {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    token_type: string;
    scope: string[];
}

export let defaultOauth2 = ():DiscordOauth2Interface => {
    return { 
        scopes: settings.api.oauth2.discord.scopes,
        client_secret: settings.api.oauth2.discord.client_secret, 
        client_id: settings.api.oauth2.discord.client_id,
        redirect_uri: settings.api.oauth2.discord.redirect_uri,
    }
}

export let generateURL = async(authObj?:DiscordOauth2Interface) => {
    if(!authObj) authObj = defaultOauth2();

    // Generate the URL
    let query = new URLSearchParams();

    query.set('client_id', authObj.client_id);  
    query.set('redirect_uri', authObj.redirect_uri);
    query.set('response_type', 'code');

    query.set('scope', authObj.scopes.join(' '));
    query.set('state', authObj.client_secret);

    // Return the URL
    return endpoints.authorize + '?' + query.toString();    
};

export let resolveRefreshToken = async(code:string, authObj?:DiscordOauth2Interface):Promise<string | ErrorInterface> => {
    if(!authObj) authObj = defaultOauth2();

    // Generate the URL
    let query = new URLSearchParams();

    query.set('client_id', authObj.client_id);  
    query.set('client_secret', authObj.client_secret);
    query.set('grant_type', 'authorization_code');
    query.set('redirect_uri', authObj.redirect_uri);
    query.set('code', code);

    // Make the request
    return new Promise((resolve, reject) => {
        axios.post(endpoints.token, query).then((response:any) => {
            // Dose the response have a token?
            if(response?.data?.refresh_token)
                return resolve(response.data.refresh_token);

            // If not, return an error  
            return reject({
                code: 1,
                local_key: locals.UNKNOWN_ERROR,
                message: 'Failed to resolve refresh token', 
                where: 'discord_oauth2.resolveRefreshToken()',
            });     

        }).catch((err:any) => {
            // This means that the user passed an invalid or expired code   
            if(err?.response?.data?.error_description == 'Invalid "code" in request.') return reject({
                code: 1, 
                local_key: locals.KEYS.INVALID_DISCORD_CODE,
                message: err.message, 
                where: 'discord_oauth2.resolveRefreshToken()',
            } as ErrorInterface)

            // this is for any other error encountered
            else return reject({
                code: 0, 
                local_key: locals.KEYS.UNKNOWN_ERROR,
                message: err.message, 
                where: 'discord_oauth2.resolveRefreshToken()',
            } as ErrorInterface)
        });
    });
};

export class DiscordOauth2 {
    client_id: string;
    client_secret: string;      
    redirect_uri: string;
    scopes: string[];
    refresh_token: string;
    token: string | undefined;

    constructor(refresh_token:string, token?:string, authObj?:DiscordOauth2Interface) {
        if(!authObj) authObj = defaultOauth2();

        this.client_id = authObj.client_id;
        this.client_secret = authObj.client_secret;
        this.redirect_uri = authObj.redirect_uri;
        this.scopes = authObj.scopes;
        this.refresh_token = refresh_token;
        this.token = token || undefined;
    }

    async get(resource:string) {
        switch(resource) {
            case 'token': return this.#getToken();
            case 'user': return this.#getUser();
            default: return new Promise((resolve, reject) => reject({
                code: 0,
                local_key: locals.KEYS.NOT_FOUND,
                message: 'Invalid resource',
                where: 'DiscordOauth2.get',
            } as ErrorInterface));
        }
    }

    async #getToken(): Promise<DiscordBearerInterface | ErrorInterface> {
        let query = new URLSearchParams();

        query.set('grant_type', 'refresh_token');
        query.set('refresh_token', this.refresh_token);

        return new Promise((resolve, reject) => {
            // Make the request
            axios.post(endpoints.token, query, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64')}`,
                }
            }).then((response:any) => {
                // Dose the response have a token?

                // If so, return the object
                if(response?.data?.access_token) return resolve({
                    token: (response?.data?.access_token as string) || '',    
                    refresh_token: (response?.data?.refresh_token as string) || '',
                    access_token: (response?.data?.access_token as string) || '',
                    scope: (response?.data?.scope as string[]) || [], 
                    token_type: (response?.data?.token_type as string) || '',   
                    expires_at: (response?.data?.expires_in as number) || 0 + getTimeInSeconds()
                } as DiscordBearerInterface);

                // If not, return an error  
                else return reject({
                    code: 1,
                    local_key: locals.UNKNOWN_ERROR,
                    message: 'Failed to resolve refresh token', 
                    where: 'discord_oauth2.resolveRefreshToken()',
                });     
            }).catch((err:any) => {
                // Is this an invalid refresh token?
                if(err?.response?.data?.error == 'invalid_grant') return reject({
                    code: 1, 
                    local_key: locals.KEYS.INVALID_DISCORD_GRANT,
                    message: returnLocal(locals.KEYS.INVALID_DISCORD_GRANT), 
                    where: 'discord_oauth2.resolveRefreshToken()',
                } as ErrorInterface)

                // this is for any other error encountered
                else return reject({
                    code: 0, 
                    local_key: locals.KEYS.UNKNOWN_ERROR,
                    message: err.message, 
                    where: 'discord_oauth2.resolveRefreshToken()',
                } as ErrorInterface)
            });
        });

    }

    async #getUser() {}

    async revoke() {}
}