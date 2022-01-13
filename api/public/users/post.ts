import { getMongoDBclient } from "../../internal/database";
import { mongoErrorHandler, httpErrorHandler, httpSuccessHandler, returnLocal, locals } from "../response_handler";
import { UserInterface, UserInterfaceTemplate } from "../interfaces";

export default async (req:any, res:any, resources:string[]):Promise<void> => {
    getMongoDBclient(global.__DEF_DATABASE__, undefined, res).insertOne(UserInterfaceTemplate() as any, (err:any, result:any) => {
        if (err) return mongoErrorHandler(err.code, res, JSON.stringify(err.keyPattern));
        httpSuccessHandler(201, res, returnLocal(locals.KEYS.USER_SUCCESSFULLY_ADDED));
    });
}