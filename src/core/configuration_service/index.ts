import { ErrorInterface, GlobalRoleObjectInterface } from "../interfaces";
import { get as getGlobalRoleObject } from "./src/roleObject";

export const globalRoleObject = {
    get: async(filter?:any): Promise<GlobalRoleObjectInterface | ErrorInterface> => getGlobalRoleObject(filter)
}