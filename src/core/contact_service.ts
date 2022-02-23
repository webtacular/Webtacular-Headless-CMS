import { EmailContentInterface, EmailFunctionInterface, ErrorInterface } from "./interfaces";
import { locals, returnLocal } from "./response_handler";

let email_object:{
    sendMail?: EmailFunctionInterface;
} = {};

export const setEmailHandler = (func: EmailFunctionInterface) => {
    Object.assign(email_object, { sendMail: func });
}   

export const sendMail = async (emailObject: EmailContentInterface): Promise<boolean | ErrorInterface> => {
    return new Promise((resolve, reject) => {
        if(!email_object?.sendMail) return reject({
            code: 0,
            local_key: locals.KEYS.EMAIL_HANDLER_NOT_SET,
            where: 'contact_service.sendMail()',
            message: returnLocal(locals.KEYS.EMAIL_HANDLER_NOT_SET),    
        } as ErrorInterface);

        // Some incredible TypeScript right here, I know, Im sorry.
        let sendMail = (email_object.sendMail as any) as (emailObject: EmailContentInterface) => Promise<boolean | ErrorInterface>;

        sendMail(emailObject)
        .then(() => resolve(true))
        .catch((err) => reject(err));
    });
}