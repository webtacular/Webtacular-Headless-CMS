import { RoleInterface } from "../../interfaces";
import { localDB } from "../../db_service";
import { db_name } from "../";
import validateRole from "./role_validation_service"

/**
 * adds a role to the database
 * 
 * @param role RoleInterface - the role details to add
 */
export default (role:RoleInterface):boolean => {
    
    // validate the role and its permissions
    if(validateRole(role) !== true) return false;

    // Push the role to the database
    localDB.getDB(db_name).push(`/roles/${role.name.toLowerCase()}`, role);

    // Return true
    return true;
}