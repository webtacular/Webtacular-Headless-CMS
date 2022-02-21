/*
    LOGIN > | 
            | OAUTH2 > | 
            |          | old user > |
            |          |            | Find the user and log them in
            |          |
            |          | New user > |
            |                       |  email already exists > |
            |                       |                         | force them to login with their password to link their account
            |                       |
            |                       |  new email -----------> |
            |                                                 | Create the account with the oauth2 info
            |                                                 | make them create a password else delete the account
            |
            |
            | EMAIL/PASS/USERNAME > |
            |                       | Find user, compare password hashes, return user
            |
            |
            | SMS > |
                    | Find user, compare password hashes, return user
*/

import { graphql } from "../../api";
import { DiscordBearerInterface, DiscordOauth2Interface, ErrorInterface } from "../interfaces";
import { rootResolvers } from "./gql/graphQL";
import { url, authorize, refresh, get, defualt } from "./src/discord";

export const discord = {
        url: (authObj?:DiscordOauth2Interface):string => url(authObj),
        authorize: async (code:string, authObj?:DiscordOauth2Interface):Promise<DiscordBearerInterface | ErrorInterface> => authorize(code, authObj),        
        refresh: async (refreshToken:string, authObj?:DiscordOauth2Interface):Promise<DiscordBearerInterface | ErrorInterface> => refresh(refreshToken, authObj),  
        get: async (type:string, token:DiscordBearerInterface):Promise<any | ErrorInterface> => get(type, token),  
        gql: ():any => graphql.expand(__dirname, 'gql/schema.gql', rootResolvers),
        default: ():DiscordOauth2Interface => defualt(),
}
