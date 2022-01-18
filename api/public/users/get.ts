import { getMongoDBclient } from "../../internal/db_service";
import { ObjectId } from 'mongodb';
import { mongoErrorHandler, httpErrorHandler, httpSuccessHandler, returnLocal, locals } from "../response_handler";
import { checkForToken } from "../../internal/token_service";

export default async (req:any, res:any, resources:string[]):Promise<void> => {
    // Start checking for tokens in the background
    let tokenInfo = checkForToken(req, res, false);

    // If the userID is not defined, return a 401
    if(!(resources[1] as any)?.id) 
        return httpErrorHandler(400, res, returnLocal(locals.KEYS.MISSING_USER_ID, locals.language));

    getMongoDBclient(global.__DEF_MONGO_DB__, undefined, res).findOne({ _id: new ObjectId((resources[1] as any).id) }, async(err:any, result:any) => {
        // If the DB throws an error, pass it to the error handler
        if (err)
            return mongoErrorHandler(err.code, res, JSON.stringify(err.keyPattern));

        // If we cant find the user, return a 404
        if (result === null || result === undefined)
            return httpErrorHandler(404, res, returnLocal(locals.KEYS.USER_NOT_FOUND, locals.language));

        // Make sure we completed the token check
        await tokenInfo;

        //----------------------------------//
        // Basic information about the user //
        //----------------------------------//
        let respData:any = {
            _id: result?._id.toString(),
            user_name: result?.user_name,
            language: result?.language,
            profile_picture: result?.profile_picture,

            blog_info: result?.blog_info,
        };

        //-----------------------------------------------//
        // If the use is an admin, return the admin data //
        //-----------------------------------------------//
        if(req.auth.admin === true) Object.assign(respData, { 
            email: result?.email,
            previous_info: {
                user_name: result?.previous_info?.user_name,
                email: result?.previous_info?.email,
                password: result?.previous_info?.password,
            },
            security_info: result?.security_info,
            tokens: result?.tokens
        });

        //----------------------------------------------------------//
        // if the user is authorized, return more of the users data //
        //----------------------------------------------------------//
        else if(req.auth.userID === result._id.toString()) Object.assign(respData, { 
            email: result?.email,
            previous_info: {
                user_name: result?.previous_info?.user_name,
                email: result?.previous_info?.email,
            },
            security_info: {
                signup_ip: result?.security_info?.signup_ip,
                account_creation: result?.security_info?.account_creation,
                last_login: result?.security_info?.last_login,
                email_verified: result?.security_info?.email_verified,
            },
            tokens: result?.tokens
        });

        //finaly, return the data
        return httpSuccessHandler(200, res, respData, {
            'Content-Type': 'application/json',
        });
    });
}