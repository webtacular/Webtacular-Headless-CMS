import { getMongoDBclient } from "../../internal/database";
import { mongoErrorHandler, httpErrorHandler, httpSuccessHandler, returnLocal, locals } from "../response_handler";
import { UserInterface, UserInterfaceTemplate } from "../interfaces";
import { userRegex } from "../../internal/regex";
import { hashPassword } from "../../internal/passwords";
import emailRegex from 'email-regex';

export default async (req:any, res:any, resources:string[]):Promise<void> => {
    let user:UserInterface = UserInterfaceTemplate(),
        json = req.body;

    if(!json.user_name || userRegex.user_name.test(json.user_name) === false)
        return httpErrorHandler(406, res, returnLocal(locals.KEYS.SIGNUP_INVALID_USERNAME, req.language.language));

    if(!json.email || emailRegex({exact: true}).test(json.email) === false)
        return httpErrorHandler(406, res, returnLocal(locals.KEYS.SIGNUP_INVALID_EMAIL, req.language.language));

    if(!json.password || userRegex.password.test(json.password) === false)
        return httpErrorHandler(406, res, returnLocal(locals.KEYS.SIGNUP_INVALID_PASSWORD, req.language.language));

    user.current_info = {
        user_name: json.user_name,
        email: json.email,
        password: hashPassword(json.password),
    }

    getMongoDBclient(global.__DEF_DATABASE__, undefined, res).insertOne(user as any, (err:any, result:any) => {
        if (err) return mongoErrorHandler(err.code, res, JSON.stringify(err.keyPattern));
        else httpSuccessHandler(201, res, returnLocal(locals.KEYS.USER_SUCCESSFULLY_ADDED, req.language.language));
    });
}