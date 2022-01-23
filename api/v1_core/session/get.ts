import { ObjectId } from "mongodb";
import { mongoDB } from "../../internal/db_service";
import { compareHash } from "../../internal/hashing_service";
import { EMAIL_REGEXP, userRegex } from "../../internal/regex_service";
import { checkForToken, generateToken } from "../../internal/token_service";
import { httpErrorHandler, httpSuccessHandler, locals, mongoErrorHandler, returnLocal } from "../../internal/response_handler";
import {getTimeInSeconds} from "../../internal/general_service";

//TODO: Fix this.
//I threw this together quickly and it's not very good.
//I needed something that would work for now.

//[1] I need to add acutal checks for new login locations,
//  Has the user used this IP before?

//[2] Check if the user requesting this data is an admin,
//  Implament a better token system, while keeping all the functionality

//[3] Limti the number of login attempts,
//  If the user has exceeded the max number of login attempts,
//  Lock the account and send out an email to unlock the account.

//[4] Limit the ammount of active tokens for a user
//  If the user has exceeded the max number of active tokens,
//  we can ask the user to deauth some current tokens, or the one last used.

let throw406 = (key:string, res:any, replace:any = {}):void =>
    httpErrorHandler(406, res, returnLocal(key, res.language.language, replace));
    
export default async (req:any, res:any, resources:string[]):Promise<void> => {
    // check for the token data
    await checkForToken(req, res, false);

    let json = req.body;

    // If the user is already logged in, return a 409: conflict //
    if(req.auth.authorized === true)
        return httpErrorHandler(409, res, returnLocal(locals.KEYS.ALREADY_AUTHORIZED, locals.language));

    //---Email---//
    if(json.email === undefined) //No email
        return throw406(locals.KEYS.SIGNUP_NO_EMAIL, res);

    if(EMAIL_REGEXP.test(json.email) !== true) //Invalid email
        return throw406(locals.KEYS.SIGNUP_INVALID_EMAIL, res);
    //---Email---//

    //---Password---//
    if(json.password === undefined) //No password
        return throw406(locals.KEYS.SIGNUP_NO_PASSWORD, res);

    if(userRegex.password.test(json.password) !== true) //Invalid password
        return throw406(locals.KEYS.SIGNUP_INVALID_PASSWORD, res);
    //---Password---//

    mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.user_collection, res).findOne({ email: json.email.toLowerCase() }, async(err:any, result:any) => {
        // If the DB throws an error, pass it to the error handler
        if (err) return mongoErrorHandler(err.code, res, err.keyPattern);

        // If we cant find the user, return a 404
        if (result === null || result === undefined)
            return httpErrorHandler(404, res, returnLocal(locals.KEYS.USER_NOT_FOUND, locals.language));

        //TODO: Check if the user is locked out

        // check password //
        if(await compareHash(json.password, result.password) !== true)
            return failHandler(res, req, result);
        
        else succsessHandler(res, req, result);
    });
}


//   _____                             
//  / ____|                            
// | (___  _   _  ___ ___ ___  ___ ___ 
//  \___ \| | | |/ __/ __/ _ \/ __/ __|
//  ____) | |_| | (_| (_|  __/\__ \__ \
// |_____/ \__,_|\___\___\___||___/___/

let succsessHandler = (res:any, req:any, result:any) => {
    let login_attempts:Array<string> = [];

    result?.security_info.login_attempts?.forEach((elem:any, i:number) => {
        if(i <= global.__SECURITY_OPTIONS__.max_login_history)
            login_attempts = [...login_attempts, elem];
    });

    let token = generateToken(result._id.toString(), global.__SECURITY_OPTIONS__.token_expiration),
        expiration = getTimeInSeconds() + global.__SECURITY_OPTIONS__.token_expiration,
        user = {
            security_info: {
                attempts: 0,
                account_locked: false,
                last_login: getTimeInSeconds(),
                login_attempts,
            }
        }

    mongoDB.getClient(global.__DEF_MONGO_DB__, undefined, res).findOneAndUpdate({ 
        _id: new ObjectId(result._id) 
    }, { $set: user } as any, async(err:any, result:any) => {
        if (err) return mongoErrorHandler(err.code, res, err.keyPattern);

        //Tell the client to set some cookies
        res.cookie('token', token, {
            maxAge: expiration,
            secure: true,
        });

        res.cookie('user_id', result._id, {
            secure: true,
        });

        //Inform the user that they have been logged in successfully
        return httpSuccessHandler(202, res, {
            user_id: result._id,
            token: (await token)?.combined,
        }, {
            'Content-Type': 'application/json',
        });  
    }); 
}


//  ______    _____ _ 
// |  ____|  |_   _| |
// | |__ __ _  | | | |
// |  __/ _` | | | | |
// | | | (_| |_| |_| |
// |_|  \__,_|_____|_|

//FIXME: this is stupid.
let failHandler = (res:any, req:any, result:any) => {
    let login_attempts:Array<string> = [];

    result.security_info.login_attempts.forEach((elem:any, i:number) => {
        if(i <= global.__SECURITY_OPTIONS__.max_login_history)
            login_attempts = [...login_attempts, elem];
    });

    let attempts = parseInt(result?.security_info?.attempts || 0) + 1,
        user = {
        security_info: {
            attempts,
            account_locked: false,
            login_attempts,
        }
    }
    
    mongoDB.getClient(global.__DEF_MONGO_DB__, undefined, res).findOneAndUpdate(
    { _id: new ObjectId(result._id)  }, 
    { $set: user }, 
    (err:any, new_result:any) => {
        if (err) return mongoErrorHandler(err.code, res, err.keyPattern);
        
        return httpErrorHandler(401, res, returnLocal(locals.KEYS.INVALID_PASSWORD, locals.language, { 
            0: global.__SECURITY_OPTIONS__.max_login_attempts - attempts
        }));
    }); 
}