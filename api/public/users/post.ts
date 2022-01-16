import { getMongoDBclient } from "../../internal/database";
import { mongoErrorHandler, httpErrorHandler, httpSuccessHandler, returnLocal, locals } from "../response_handler";
import { UserInterface, UserInterfaceTemplate } from "../interfaces";
import { userRegex, EMAIL_REGEXP } from "../../internal/regex";
import { hashPassword } from "../../internal/passwords";
import { checkIPlogs, getIP, logNewIP, logSameIP } from "../../internal/ip_address";
import { ObjectId } from "mongodb";

let throw406 = (key:string, res:any, replace:any = {}):void => {
    return httpErrorHandler(406, res, returnLocal(key, res.language.language, replace));
}

export default async (req:any, res:any, resources:string[]):Promise<void> => {
    let user:UserInterface = UserInterfaceTemplate(),
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
    let password = hashPassword(json.password, res),
        user_id = new ObjectId().toString(),
        ip = getIP(req);

    //Check if we have seen this IP before
    let ip_history = await checkIPlogs(ip, user_id, res),
        pass_func:any = () => {};

    //If this is an IP we've never seen, create a new entry in the DB
    if(ip_history === null)
        pass_func = () => logNewIP(ip, user_id, res);

    else {
        let last_accessed = Date.now() - ip_history.last_accessed;

        //If the user is trying to create multiple accounts with the same IP,
        //We can impose a time out.
        if(global.__AUTH_COLLECTIONS__.new_account_timeout > last_accessed) 
            return throw406(locals.KEYS.SIGNUP_IP_TIMEOUT, res, { 0:(global.__AUTH_COLLECTIONS__.new_account_timeout - last_accessed) });

        //If the user is trying to create a bounch of accounts with one IP, we can
        //Cap the ammount of accounts he can make
        if(global.__AUTH_COLLECTIONS__.accounts_per_ip > 0)
            if(ip_history.accounts.length >= global.__AUTH_COLLECTIONS__.accounts_per_ip)
                return throw406(locals.KEYS.SIGNUP_MAX_ACC_IP, res);

        //If the IP passes checks, let the user trough
        pass_func = () => logSameIP(ip_history, user_id, res);
    }
    
    Object.assign(user, { 
        _id: new ObjectId(user_id),

        user_name: json.user_name,
        email: json.email,
        password: await password,

        security_info: {
            signup_ip: getIP(req),
        }
    });

    //Push the data to mongoDB
    getMongoDBclient(global.__DEF_DATABASE__, global.__AUTH_COLLECTIONS__.user_collection, res).insertOne(user as any, (err:any, result:any) => {
        if (err) return mongoErrorHandler(err.code, res, JSON.stringify(err.keyPattern));
        else {
            //We only want to log IP's if the account was created succesfully
            //eg something could fail, we log the IP, but it dosent belong to anyone
            pass_func();

            //Inform the user that their account has been succesfully created
            return httpSuccessHandler(201, res, returnLocal(locals.KEYS.USER_SUCCESSFULLY_ADDED, req.language.language));
        }
    });
}