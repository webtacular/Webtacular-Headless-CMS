import { graphql } from "../../../api"

const oauthRouter = (resolvers:any, params:any, req:any, context:any) => {
    console.log(params);
    let filtered = graphql.filter(context).oauth;

    Object.keys(filtered).forEach(key => {
        switch(key.toLowerCase()) {
            case 'discord': return require('../src/discord').default(resolvers, params, req, context);
        }
    });
}

const Reg = (resolvers:any, params:any, req:any, context:any) => {
    console.log(graphql.nested(context));
}

export const Mutations = {
    oauth: Reg,
    register: Reg
}