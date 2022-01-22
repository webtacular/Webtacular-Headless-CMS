import {httpErrorHandler, locals, returnLocal} from "../../internal/response_handler";

export default async (req:any, res:any, resources:string[]):Promise<void> => {
    if(!(resources[2] as any)?.type)
        return httpErrorHandler(400, res, returnLocal(locals.KEYS.MISSING_CONTENT_TYPE, locals.language));

}
