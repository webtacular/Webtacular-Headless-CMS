import { checkForToken, validateToken } from "../../internal/token_service";
import { httpErrorHandler, locals, mongoErrorHandler, returnLocal } from "../../internal/response_handler";
import { getMongoDBclient } from "../../internal/db_service";
import { ObjectId } from "mongodb";
import { TokenInterface } from "../../internal/interfaces";

export default async (req:any, res:any, resources:string[]):Promise<void> => {
    // Start checking for tokens
    let tokenCheck:boolean = await checkForToken(req, res, true);

    // If the token is valid, just return. the error handeling is done by the strict parameter in checkForToken
    if(tokenCheck !== true) 
        return;

    // If the userID is not defined, return a 401
    if(!(resources[1] as any)?.token) 
        return httpErrorHandler(400, res, returnLocal(locals.KEYS.MISSING_TOKEN, locals.language));

    // validate the token
    let tokenInfo:TokenInterface = await validateToken((resources[1] as any)?.token);

    // If the userID is not defined, return a 401
    if(!tokenInfo.user_id)
        return httpErrorHandler(401, res, returnLocal(locals.KEYS.INVALID_TOKEN, locals.language));

    // The object to find in the database
    let mongoDBfindOBJ:any = {
        _id: new ObjectId(tokenInfo.user_id)
    }

    // Get the client and make the request
    getMongoDBclient(global.__DEF_MONGO_DB__, undefined, res).findOne(mongoDBfindOBJ, async(err:any, result:any) => {
        // If there is an error, pass it to the error handler
        if (err) return mongoErrorHandler(err.code, res, JSON.stringify(err.keyPattern));

        console.log(result);
    });
}