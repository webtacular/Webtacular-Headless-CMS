import { permissions } from "..";
import { RoleInterface } from "../../interfaces";
import { roleRegex } from "../../regex_service";

export default (role:RoleInterface):boolean => {
    // validate the name
    if(roleRegex.role_name.test(role?.name) !== true)
        return false;

    // validate the color
    if(roleRegex.role_color.test(role?.color) !== true)
        return false;

    let pass:boolean = false;

    // validate the permissions 
    Object.keys(role?.permissions).forEach(elem => {
        // validate the name
        if(roleRegex.permission.test(elem) !== true)
            pass = false;

        // validate the value
        if(permissions.includes(elem.toLowerCase()) !== true)
            pass = false;
    });

    return true;
}