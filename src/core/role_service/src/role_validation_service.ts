import { ObjectId } from "mongodb";
import { permissions } from "..";
import { ErrorInterface, RoleInterface } from "../../interfaces";
import { roleRegex } from "../../regex_service";
import { locals, returnLocal } from "../../response_handler";

export default (role:RoleInterface, returnError?:boolean):boolean | ErrorInterface => {
    // validate the name
    if(roleRegex.role_name.test(role?.name) !== true){
        if(returnError === true)
            return { local_key: 'INVALID_ROLE_NAME' } as ErrorInterface;

        return false;
    }

    // validate the color
    if(roleRegex.role_color.test(role?.color) !== true){
        if(returnError === true) 
            return { local_key: 'INVALID_ROLE_COLOR' } as ErrorInterface;

        return false;
    }

    let pass:boolean = false,
        error_obj:ErrorInterface = {
            local_key: '',
            message: '',
        };

    // validate the permissions 
    for(let elem of Object.keys(role?.permissions)) {

        // validate the name
        if(roleRegex.role_permissions.test(elem) !== true){
            error_obj = {
                local_key: 'INVALID_PERMISSION_NAME',
                where: elem,
                message: returnLocal(locals.KEYS.INVALID_PERMISSION_NAME)
            };

            pass = false;

            break;
        }

        // validate the value
        if(permissions.includes(elem.toLowerCase()) !== true){
            error_obj = {
                local_key: 'INVALID_PERMISSION_VALUE',
                where: elem,
                message: returnLocal(locals.KEYS.INVALID_PERMISSION_VALUE)
            };

            pass = false;

            break;
        }
    };

    // validate the user ids
    for(let elem of role?.users) {
        if(ObjectId.isValid(elem) !== true){
            error_obj = {
                local_key: 'INVALID_USER_ID',
                where: elem.toString(),
                message: returnLocal(locals.KEYS.INVALID_USER_ID)
            };

            pass = false;

            break;
        }
    };

    if(returnError === true) return error_obj;
    return pass;
}