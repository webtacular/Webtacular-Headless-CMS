import { graphql } from "../../api";
import { DiscordBearerInterface, DiscordOauth2Interface, DiscordUserInterface, ErrorInterface, OauthInterface } from "../interfaces";
import { rootResolvers } from "./gql/graphQL";
import { url, authorize, refresh, identity, defualt, revoke } from "./src/discord";
import resolveID from './src/database';

export const discord = {
        url: (authObj?:DiscordOauth2Interface):string => url(authObj),
        authorize: async (code:string, authObj?:DiscordOauth2Interface):Promise<DiscordBearerInterface | ErrorInterface> => authorize(code, authObj),        
        refresh: async (refreshToken:string, authObj?:DiscordOauth2Interface):Promise<DiscordBearerInterface | ErrorInterface> => refresh(refreshToken, authObj),  
        gql: ():any => graphql.expand(__dirname, 'gql/schema.gql', rootResolvers),
        identity: async (token:DiscordBearerInterface):Promise<DiscordUserInterface | ErrorInterface> => identity(token),
        revoke: async (token:DiscordBearerInterface):Promise<boolean | ErrorInterface> => revoke(token),
        default: ():DiscordOauth2Interface => defualt(),
        resolveID: (id:string, filter?:any): Promise<OauthInterface[]> => resolveID(id, filter)
}
