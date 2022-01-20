import { getMongoDBclient } from "../../internal/db_service";
import { mongoErrorHandler, httpErrorHandler, httpSuccessHandler, returnLocal, locals } from "../../internal/response_handler";
import { UserInterface, UserInterfaceTemplate } from "../../internal/interfaces";
import { userRegex, EMAIL_REGEXP } from "../../internal/regex_service";
import { hashString } from "../../internal/hashing_service";
import { checkIPlogs, getIP, logNewIP, logSameIP } from "../../internal/ip_service";
import { ObjectId } from "mongodb";
import { generateToken } from "../../internal/token_service";

let throw406 = (key:string, res:any, replace:any = {}):void =>
    httpErrorHandler(406, res, returnLocal(key, res.language.language, replace));

export default async (req:any, res:any, resources:string[]):Promise<void> => {
    let user:any = UserInterfaceTemplate(),
        json = req.body;

    //---Username---//
    if(json.user_name === undefined) //No Username
        return throw406(locals.KEYS.SIGNUP_NO_USERNAME, res);

    if(userRegex.user_name.test(json.user_name) !== true) //Invalid Username
        return throw406(locals.KEYS.SIGNUP_INVALID_USERNAME, res);
    //---Username---//

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

    //We will start hashing the password while we do some checks on the
    //Users IP
    let password = hashString(json.password, global.__SECURITY_OPTIONS__.password_salt_rounds, res),
        user_id = new ObjectId().toString(),
        ip = getIP(req);

    //Check if we have seen this IP before
    let ip_history = await checkIPlogs(ip, res),
        pass_ip_func:any = () => {};

    //If this is an IP we've never seen, create a new entry in the DB
    if(ip_history === null)
        pass_ip_func = () => logNewIP(ip, user_id, res);

    else {
        let last_accessed = Date.now() - ip_history.last_accessed;

        //If the user is trying to create multiple accounts with the same IP,
        //We can impose a time out.
        if(global.__SECURITY_OPTIONS__.new_account_timeout > last_accessed && ip_history.settings.bypass_timeout !== true) 
            return throw406(locals.KEYS.SIGNUP_IP_TIMEOUT, res, { 0:(global.__SECURITY_OPTIONS__.new_account_timeout - last_accessed) });

        //If the user is trying to create a bounch of accounts with one IP, we can
        //Cap the ammount of accounts he can make
        if(global.__SECURITY_OPTIONS__.accounts_per_ip > 0 && ip_history.settings.bypass_acc_limit !== true)
            if(ip_history.count >= global.__SECURITY_OPTIONS__.accounts_per_ip)
                return throw406(locals.KEYS.SIGNUP_MAX_ACC_IP, res);

        //If the IP passes checks, let the user trough
        pass_ip_func = () => logSameIP(ip_history, user_id, res);
    }

    let token = generateToken(user_id, global.__SECURITY_OPTIONS__.token_expiration),
        expiration = Date.now() + global.__SECURITY_OPTIONS__.token_expiration;
    
    Object.assign(user, { 
        _id: new ObjectId(user_id),

        user_name: json.user_name,
        email: json.email.toLowerCase(),
        password: await password,

        security_info: {
            signup_ip: getIP(req),
            last_login: Date.now(),
            last_email: Date.now(),
            account_creation: Date.now(),
            account_locked: false,
            email_verified: false,
            attempts: 0,
        }
    });

    //Push the data to mongoDB
    getMongoDBclient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.user_collection, res).insertOne(user, async (err:any, result:any) => {
        if (err) return mongoErrorHandler(err.code, res, err.keyPattern);

        //We only want to log IP's if the account was created succesfully
        //eg something could fail, we log the IP, but it dosent belong to anyone
        pass_ip_func();

        //TODO: Send a email confirmation to the user
        let combined_token = (await token).combined;

        //Tell the client to set some cookies
        res.cookie('token', { token: combined_token }, {
            maxAge: expiration,
            secure: true,
        });

        res.cookie('user_id', user_id, {
            secure: true,
        });

        //Inform the user that their account has been succesfully created
        return httpSuccessHandler(201, res, {
            user_id: user_id,
            token: combined_token,
        });  
    });
}