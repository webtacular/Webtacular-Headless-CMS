import { graphql } from "../../../api"

const oauthRouter = (resolvers:any, params:any, req:any, context:any) => {
    let filtered = graphql.filter(context).oauth;

    Object.keys(filtered).forEach(key => {
        switch(key.toLowerCase()) {
            case 'discord': return require('../src/discord').default(resolvers, params, req, context);
        }
    });
}

export const Mutations = {
    oauth:  oauthRouter
}