import {checkForToken, generateToken} from "../../internal/token_service";
import {httpErrorHandler, locals, returnLocal} from "../response_handler";

export default (req:any, res:any, resources:string[]):void => {
    // Start checking for tokens in the background
    let tokenInfo = checkForToken(req, res, false);

     // If the userID is not defined, return a 401
     if(!(resources[1] as any)?.id) 
         return httpErrorHandler(400, res, returnLocal(locals.KEYS.MISSING_USER_ID, locals.language));


    res.status(200).send('DELETE request');
    res.end();
}