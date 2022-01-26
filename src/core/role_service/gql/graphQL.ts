import { roleRegex } from "../../regex_service";
import { role as role_service } from "../";
import { RoleInterface } from "../../interfaces";

let role = async (args:any, req:any) => {
    // Test the Name
    if(roleRegex.role_name.test(args?.name) !== true)
        return;
    
    // Try to get the role
    let role_data:RoleInterface | false = role_service.get(args?.name);

    // If the role does not exist, return nothing
    if(role_data === false) return;

    // If the role is found, return the data
    else return role_data;
}

export const rootFuncs = {
    role: (args:any, req:any) => role(args, req)
}