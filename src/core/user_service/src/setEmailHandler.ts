import {EmailContentInterface, ErrorInterface, UserInterface} from "../../interfaces";
import {locals, returnLocal} from "../../response_handler";

export let sendEmail = async (content:EmailContentInterface, email:string, returnError?:boolean):Promise<UserInterface | boolean | ErrorInterface> => {
    return new Promise((resolve, reject) => {
        if(returnError === true) {
            reject({
                code: 1,
                local_key: locals.KEYS.NOT_IMPLEMENTED,
                message: returnLocal(locals.KEYS.NOT_IMPLEMENTED),
                where: 'user_service.sendEmail',
            } as ErrorInterface);
        }

        resolve(false);
    });
}

export default (func:(content:EmailContentInterface, email:string, returnError?:boolean) => Promise<UserInterface | boolean | ErrorInterface>): void => {
    sendEmail = func;
}