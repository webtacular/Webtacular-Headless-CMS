import { discord } from "..";
import { graphql } from "../../../api";
import { checkForToken } from '../../token_service';

let discord_gql = async(args:any, req:any, context:any) => {
    // Get the data
    let data = discord.default();

    // Parse the data
    let base = {
        client_id: data.client_id,
        redirect_uri: data.redirect_uri,
        scopes: data.scopes,
        url: discord.url()
    }

    // Is the user an admin?
    if((req as any)?.auth?.admin === true) 
        Object.assign(base, { client_secret: data.client_secret });

    // Return the data
    return base;
}

let oauth = async(args:any, req:any, context:any) => {  
    // Check if the request is authenticated
    await checkForToken(req);

    // Get the filter 
    let filter = Object.keys(graphql.filter(context).oauth);

    // remove duplicate filters
    filter = [...new Set(filter)];

    // response object
    let base = {};

    // build the response object
    filter.forEach((key:string) => {
        switch(key) {
            case 'discord': Object.assign(base, { discord: discord_gql(args, req, context) }); break;
        }
    });

    // return the response
    return base;
}

export const rootResolvers = {
    oauth: (args:any, req:any, context:any) => oauth(args, req, context)
}   