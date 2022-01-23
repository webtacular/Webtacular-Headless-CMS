import { ObjectId } from 'mongodb';
import { UserInterface } from '../../internal/interfaces';
import { httpErrorHandler, httpSuccessHandler, returnLocal, locals } from "../../internal/response_handler";
import { checkForToken } from "../../internal/token_service";
import { user } from '../../internal/user_service';

export default async (req:any, res:any, resources:string[]):Promise<void> => {

    // Start checking for tokens in the background
    let tokenInfo = checkForToken(req, res, false);


    // If the userID is not defined, return a 401
    if(!(resources[1] as any)?.id) 
        return httpErrorHandler(400, res, returnLocal(locals.KEYS.MISSING_USER_ID, locals.language));

    // verify the userID is a valid ObjectId
    if(ObjectId.isValid((resources[1] as any)?.id) !== true)
        return httpErrorHandler(400, res, returnLocal(locals.KEYS.INVALID_USER_ID, locals.language));

    
    // if the token is valid, try to get the user
    let user_data: boolean | UserInterface = await user.get(new ObjectId((resources[1] as any).id), res)

    // if the user is not found, the getUser function will return false
    // all we have to do is return, the error handeling is done by passing the res object to the getUser function
    if(user_data === false) return;
    else user_data = user_data as UserInterface;

    // Make sure we completed the token check
    await tokenInfo;


    //----------------------------------//
    // Basic information about the user //
    //----------------------------------//
    let respData:any = {
        _id: user_data?._id?.toString(),
        user_name: user_data?.user_name,
        language: user_data?.language,
        profile_picture: user_data?.profile_picture,

        blog_info: user_data?.blog_info,
    };

    //-----------------------------------------------//
    // If the use is an admin, return the admin data //
    //-----------------------------------------------//

    //TODO: Verify using roles.
    if(req?.auth?.owner === true) Object.assign(respData, { 
        email: user_data?.email,
        previous_info: {
            user_name: user_data?.previous_info?.user_name,
            email: user_data?.previous_info?.email,
            password: user_data?.previous_info?.password,
        },
        security_info: user_data?.security_info,
    });

    //----------------------------------------------------------//
    // if the user is authorized, return more of the users data //
    //----------------------------------------------------------//
    else if(req?.auth?.user_id === user_data?._id?.toString()) Object.assign(respData, { 
        email: user_data?.email,
        previous_info: {
            user_name: user_data?.previous_info?.user_name,
            email: user_data?.previous_info?.email,
        },
        security_info: {
            signup_ip: user_data?.security_info?.signup_ip,
            account_creation: user_data?.security_info?.account_creation,
            last_login: user_data?.security_info?.last_login,
            email_verified: user_data?.security_info?.email_verified,
        }
    });


    //finaly, return the data
    return httpSuccessHandler(200, res, respData);

}