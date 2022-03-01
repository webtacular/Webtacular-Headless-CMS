import { ErrorInterface, FilterGlobalRoleObject, GlobalRoleObject, UpdateGlobalRoleObject } from "../interfaces";
import { get as getGlobalRoleObject, set as setGlobalRoleObject} from "./src/roleObject";

export const globalRoleObject = {
    get: async(filter?: FilterGlobalRoleObject): Promise<GlobalRoleObject | ErrorInterface> => getGlobalRoleObject(filter),
    set: async(set: UpdateGlobalRoleObject, filter?: FilterGlobalRoleObject): Promise<GlobalRoleObject | ErrorInterface> => setGlobalRoleObject(set, filter)    
}