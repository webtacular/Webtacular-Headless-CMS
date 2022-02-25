import { graphql } from "../../../api"
import DiscordMutation from '../src/discord';

const oauthRouter = async(resolvers:any, params:any, req:any, context:any) => {
    // Get the oAuth2 type that is being requested
    let filtered = graphql.filter(context).oauth;

    let returnable:any = {};

    const createReturnable = async(key:string):Promise<any> => {
        return new Promise(async(resolve) => {
            switch(key.toLowerCase()) {
                // Discord //
                case 'discord': 
                    return resolve(returnable['discord'] = await DiscordMutation(
                        resolvers, 
                        graphql.nested(context)?.oauth?.discord, 
                        req, 
                        context
                    ));
            }
        });
    }

    // Loop through the oAuth2 types
    for(let key in filtered) {
        await createReturnable(key)
    }

    // Return the result
    return returnable;
}

const Reg = (resolvers:any, params:any, req:any, context:any) => {
    console.log(graphql.nested(context).register);
}

export const Mutations = {
    oauth: oauthRouter,
    register: Reg
}