import { DiscordBearerInterface, DiscordUserInterface } from '../../interfaces';
import { discord } from '../../oauth_service';

export default async(resolvers:any, params:any, req:any, context:any) =>  {
    return new Promise(async(resolve) => {
        // Get the refresh and access tokens
        await discord.authorize(params?.token).then(async(token:any) => {
            // Make sure the token is the right type
            token = token as DiscordBearerInterface;

            // Get the User's details
            let user = await discord.identity(token).catch((err:any) => { 
                return resolve(err);
            }) as DiscordUserInterface;

            // Try to find the user in the database
            // by their id
            // If the user is not found, create a new user
            const records = await discord.resolveID(user.id);
 
            // Has a user been found?
            if(records.length === 0) {

            } 

            // Otherwise, create a new user
            else {
                
            }

        }).catch((err:any) => resolve(err));
    });
}
