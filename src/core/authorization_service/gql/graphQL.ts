import { graphql } from "../../../api"

const oauthRouter = (resolvers:any, params:any, req:any, context:any) => {
    // Get the oAuth2 type that is being requested
    let filtered = graphql.filter(context).oauth;

    // Find it
    Object.keys(filtered).forEach(key => {
        switch(key.toLowerCase()) {
            // Discord //
            case 'discord': return require('../src/discord').default(resolvers, graphql.nested(context)?.oauth?.discord, req, context);
        }
    });
}

const Reg = (resolvers:any, params:any, req:any, context:any) => {
    console.log(graphql.nested(context).register);
}

export const Mutations = {
    oauth: oauthRouter,
    register: Reg
}