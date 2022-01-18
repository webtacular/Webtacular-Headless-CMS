import {ObjectId} from "mongodb";
import {getMongoDBclient} from "../../internal/db_service";
import {getIP} from "../../internal/ip_service";
import {comparePassword} from "../../internal/password_service";
import {EMAIL_REGEXP, userRegex} from "../../internal/regex_service";
import {checkForToken, generateToken} from "../../internal/token_service";
import {httpErrorHandler, httpSuccessHandler, locals, mongoErrorHandler, returnLocal} from "../response_handler";

let throw406 = (key:string, res:any, replace:any = {}):void =>
    httpErrorHandler(406, res, returnLocal(key, res.language.language, replace));
    
export default async (req:any, res:any, resources:string[]):Promise<void> => {
    // Start checking for tokens in the background
    let tokenInfo = await checkForToken(req, res, false),
        json = req.body;

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

    getMongoDBclient(global.__DEF_MONGO_DB__, undefined, res).findOne({ email: json.email.toLowerCase() }, async(err:any, result:any) => {
        // If the DB throws an error, pass it to the error handler
        if (err) return mongoErrorHandler(err.code, res, JSON.stringify(err.keyPattern));

        // If we cant find the user, return a 404
        if (result === null || result === undefined)
            return httpErrorHandler(404, res, returnLocal(locals.KEYS.USER_NOT_FOUND, locals.language));

        //TODO: Check if the user is locked out

        // check password //
        if(await comparePassword(json.password, result.password) !== true)
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

    result.security_info.login_attempts.forEach((elem:any, i:number) => {
        if(i <= global.__SECURITY_OPTIONS__.max_login_history)
            login_attempts = [...login_attempts, elem];
    });

    let token = generateToken(result._id.toString()),
        expiration = Date.now() + global.__SECURITY_OPTIONS__.token_expiration,
        user = {
            security_info: {
                attempts: 0,
                account_locked: false,
                last_login: Date.now(),
                login_attempts,
            },
            tokens: [
                ...result.security_info.tokens || [],
                {
                    ip: getIP(req),
                    token,
                    expiration,
                    creation: Date.now(),
                }
            ]
        }

    getMongoDBclient(global.__DEF_MONGO_DB__, undefined, res).findOneAndUpdate({ 
        _id: new ObjectId(result._id) 
    }, { $set: user } as any, (err:any, result:any) => {
        if (err) return mongoErrorHandler(err.code, res, JSON.stringify(err.keyPattern));

        //Tell the client to set some cookies
        res.cookie('token', `user ${token}`, {
            maxAge: expiration,
            secure: true,
        });

        res.cookie('user_id', result._id, {
            secure: true,
        });

        //Inform the user that they have been logged in successfully
        return httpSuccessHandler(202, res, JSON.stringify({
            user_id: result._id,
            token: token,
        }), {
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
    
    getMongoDBclient(global.__DEF_MONGO_DB__, undefined, res).findOneAndUpdate(
    { _id: new ObjectId(result._id)  }, 
    { $set: user }, 
    (err:any, new_result:any) => {
        if (err) return mongoErrorHandler(err.code, res, JSON.stringify(err.keyPattern));
        
        return httpErrorHandler(401, res, returnLocal(locals.KEYS.INVALID_PASSWORD, locals.language, { 
            0: global.__SECURITY_OPTIONS__.max_login_attempts - attempts
        }));
    }); 
}