import { ObjectId } from "mongodb";
import { ErrorInterface, RoleInterface, UserInterface } from "../interfaces";
import { get as get_role, update as update_role, add as add_role, remove as remove_role, removeID, addID } from "./src/manageRole";
import { get as get_user, has as user_has, add as user_add, remove as user_remove } from "./src/manageUser";
import { get as get_precedence, set as set_precedence, remove as remove_precedence, validateDB } from "./src/managePrecedence";
import { get as get_perm, has as perm_has } from "./src/managePerms";
import { rootFuncs } from "./gql/graphQL";
import { graphql } from "../../api/";

export let permissions: Array<string> = [],
    roles:{ [key:string]:RoleInterface } = {};

//--------[ Value exports ]--------//

interface ValueInterface {
    permissions: Array<string>;
    roles: { [key:string]:RoleInterface };
}

export const values:ValueInterface = {
    permissions,
    roles,
}

//--------------------------------//


//--------[ Role exports ]--------//

interface RoleExportInterface {
    add(role: RoleInterface, returnErrorKey?: boolean): Promise<boolean | ErrorInterface>;
    remove(role: ObjectId, returnErrorKey?: boolean): Promise<boolean | ErrorInterface>;
    get(role:ObjectId | ObjectId[], filter?:any, returnErrorKey?: boolean): Promise<RoleInterface[] | false | ErrorInterface>;
    update(role: ObjectId, new_role: RoleInterface, returnErrorKey?: boolean): Promise<boolean | ErrorInterface>;
    addID(role: ObjectId, id: ObjectId, returnErrorKey?: boolean): Promise<boolean | ErrorInterface>;
    removeID(role: ObjectId, id: ObjectId, returnErrorKey?: boolean): Promise<boolean | ErrorInterface>;
}

export const role:RoleExportInterface = {
    add: (role: RoleInterface, returnErrorKey?: boolean): Promise<boolean | ErrorInterface> => add_role(role, returnErrorKey),
    remove: (role: ObjectId, returnErrorKey?: boolean): Promise<boolean | ErrorInterface> => remove_role(role, returnErrorKey),
    update: (role: ObjectId, new_role: RoleInterface, returnErrorKey?: boolean): Promise<boolean | ErrorInterface> => update_role(role, new_role, returnErrorKey),
    get: (role:ObjectId | ObjectId[], filter?:any, returnErrorKey?: boolean): Promise<RoleInterface[] | false | ErrorInterface> => get_role(role, filter, returnErrorKey),
    addID: (role: ObjectId, id: ObjectId, returnErrorKey?: boolean): Promise<boolean | ErrorInterface>=> addID(role, id, returnErrorKey),
    removeID: (role: ObjectId, id: ObjectId, returnErrorKey?: boolean): Promise<boolean | ErrorInterface> => removeID(role, id, returnErrorKey),
}

//---------------------------------//


//--------[  User exports ]--------//

interface UserExportInterface {
    get(user: UserInterface | ObjectId, returnErrorKey?: boolean):Promise<RoleInterface[] | ErrorInterface | boolean>;
    has(user: UserInterface | ObjectId, role:ObjectId[], returnErrorKey?: boolean):Promise<{ [key: string]: boolean } | ErrorInterface>;
    add(user: ObjectId, role: ObjectId, returnErrorKey?:boolean):Promise<boolean | ErrorInterface>;
    remove(user: ObjectId, role: ObjectId, returnErrorKey?: boolean):Promise<boolean | ErrorInterface>;
}

export const user:UserExportInterface = {
    get: (user: UserInterface | ObjectId, returnErrorKey?: boolean):Promise<RoleInterface[] | ErrorInterface | boolean> => get_user(user, returnErrorKey),
    has: (user: UserInterface | ObjectId, role:ObjectId[], returnErrorKey?: boolean):Promise<{ [key: string]: boolean } | ErrorInterface> => user_has(user, role, returnErrorKey),
    add: (user: ObjectId, role: ObjectId, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> => user_add(user, role, returnErrorKey),
    remove: (user: ObjectId, role: ObjectId, returnErrorKey?: boolean):Promise<boolean | ErrorInterface> => user_remove(user, role, returnErrorKey),
}

//---------------------------------//


//--------[  perm exports ]--------//

interface PermExportInterface {
    has(user: UserInterface | ObjectId, permission:string, returnErrorKey?: boolean):Promise<boolean | ErrorInterface>;
    get(role: ObjectId, returnErrorKey?: boolean):Promise<Array<string> | ErrorInterface | boolean>;
    gql():any;
}

export const perm:PermExportInterface = {
    has: (user: UserInterface | ObjectId, permission:string, returnErrorKey?: boolean):Promise<boolean | ErrorInterface> => perm_has(user, permission, returnErrorKey),
    get: (role: ObjectId, returnErrorKey?: boolean):Promise<Array<string> | ErrorInterface | boolean> => get_perm(role, returnErrorKey),
    gql: ():any => graphql.expand(__dirname, 'gql/schema.gql', rootFuncs)
}

//---------------------------------//



//------[ precedence exports ]-----//

interface PrecedenceInterface { 
    set(role: ObjectId, precedence: number, returnErrorKey?: boolean): Promise<boolean | ErrorInterface | ObjectId[]>;
    get(returnErrorKey?: boolean): Promise<boolean | ErrorInterface | ObjectId[]>;
    remove(role: ObjectId, returnErrorKey?: boolean): Promise<boolean | ErrorInterface | ObjectId[]>;
    validateDB(): Promise<void>;
}

export const precedence:PrecedenceInterface = {
    set: (role: ObjectId, precedence: number, returnErrorKey?: boolean): Promise<boolean | ErrorInterface | ObjectId[]> => set_precedence(role, precedence, returnErrorKey),
    get: (returnErrorKey?: boolean): Promise<boolean | ErrorInterface | ObjectId[]> => get_precedence(returnErrorKey),
    remove: (role: ObjectId, returnErrorKey?: boolean): Promise<boolean | ErrorInterface | ObjectId[]> => remove_precedence(role, returnErrorKey),
    validateDB: (): Promise<void> => validateDB(),
}

//---------------------------------//


//TODO: Get role details from cache and only refresh the cache if the role has changed or at the start of the server