import { discord } from "..";
import { graphql } from "../../../api";
import { checkForToken } from '../../token_service';

let selector = (type:string) => {  
    return async(a:any, b:any, c:any, d?:any) => {
        let filter:string[] = [];

        if(type === 'resolver') {
            await checkForToken(b);
            filter = Object.keys(graphql.filter(c).oauth);
        }

        else if (type === 'mutator') {
            await checkForToken(c); 
            filter = Object.keys(graphql.filter(d).oauth);  
        } 

        // remove duplicate filters
        filter = [...new Set(filter)];

        // response object
        let base = {};

        switch(type) {
            case 'resolver':        
                // build the response object
                filter.forEach((key:string) => {
                    switch(key) {
                        case 'discord': Object.assign(base, { discord: discord_resolver(a, b, c) }); break;
                    }
                });
                break;

            // case 'mutator': 
            //     // build the response object
            //     filter.forEach((key:string) => {
            //         switch(key) {
            //             case 'discord': Object.assign(base, { discord: discord_mutator(a, b, c, d) }); break;
            //         }
            //     });
            //     break;
        }
        // return the response
        return base;
    }
}


//
// RESOLVERS
//

let discord_resolver = async(args:any, req:any, context:any) => {
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

export const rootResolvers = {
    oauth: async(args:any, req:any, context:any) => selector('resolver')(args, req, context),
}   
