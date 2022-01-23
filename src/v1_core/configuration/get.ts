import {checkForToken} from "../../internal/token_service";

export default async (req:any, res:any,  resources:string[]):Promise<void> => {
    // Start checking for tokens
    let tokenCheck:boolean = await checkForToken(req, res, true);

    // If the token is valid, just return. the error handeling is done by the strict parameter in checkForToken
    if(tokenCheck !== true) return;

    // check if the user has sufficient permissions
}