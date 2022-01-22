import { getMongoDBclient } from "../../internal/db_service";
import { ObjectId } from 'mongodb';
import { mongoErrorHandler, httpErrorHandler, httpSuccessHandler, returnLocal, locals } from "../../internal/response_handler";
import { checkForToken } from "../../internal/token_service";

export default async (req:any, res:any, resources:string[]):Promise<void> => {
    // Start checking for tokens in the background
    let tokenInfo = checkForToken(req, res, false);

    // If the blogID is not defined, return a 401
    if(!(resources[1] as any)?.id) 
        return httpErrorHandler(404, res, returnLocal(locals.KEYS.MISSING_BLOG_ID, locals.language));

    if(ObjectId.isValid((resources[1] as any)?.id) !== true)
        return httpErrorHandler(400, res, returnLocal(locals.KEYS.INVALID_BLOG_ID, locals.language));

    // The object to find in the database
    let mongoDBfindOBJ:any = {
        _id: new ObjectId((resources[1] as any)?.id)
    }

    getMongoDBclient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.blog_collection, res).findOne(mongoDBfindOBJ, async(err:any, result:any) => {
        // If the DB throws an error, pass it to the error handler
        if (err)
            return mongoErrorHandler(err.code, res, err.keyPattern);

        // If we cant find the user, return a 404
        if (result === null || result === undefined)
            return httpErrorHandler(404, res, returnLocal(locals.KEYS.BLOG_NOT_FOUND, locals.language));

        // Make sure we completed the token check
        await tokenInfo;

        //----------------------------------//
        // Basic information about the blog //
        //----------------------------------//
        let respData:any = {
            _id: result?._id.toString(),

            title: result?.title,
            description: result?.description,
            creation_date: result?.creation_date,
            updates: result?.updates,
            owner_id: result?.owner_id,
        };

        //----------------------------------------------------------------------------//
        // If the use is an admin, or the owner of this blog, tell that to the client //
        //----------------------------------------------------------------------------//
        if(req?.auth?.user_id === result._id.toString() || req?.auth?.admin === true) Object.assign(respData, { 

        });
        
        //finaly, return the data
        return httpSuccessHandler(200, res, respData);
    });
}