import { checkForToken, revokeToken, validateToken } from "../../internal/token_service";
import { httpErrorHandler, locals, mongoErrorHandler, returnLocal } from "../../internal/response_handler";
import { mongoDB } from "../../internal/db_service";
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
    if(tokenInfo.authorized !== true)
        return httpErrorHandler(404, res, returnLocal(locals.KEYS.INVALID_TOKEN, locals.language));

    // The object to find in the database
    let mongoDBfindOBJ:any = {
        _id: new ObjectId(tokenInfo.user_id)
    }

    // Get the client and make the request
    mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.user_collection, res).findOne(mongoDBfindOBJ, async(err:any, result:any) => {
        
        // If there is an error, pass it to the error handler
        if (err) return mongoErrorHandler(err.code, res, err.keyPattern);

        // If the user does not exist, return a 404
        if(!result)
            return httpErrorHandler(404, res, returnLocal(locals.KEYS.USER_NOT_FOUND, locals.language));

        // revoke the token
        revokeToken((resources[1] as any)?.token);

        return httpErrorHandler(200, res, returnLocal(locals.KEYS.TOKEN_REVOKED, locals.language));
    });
}