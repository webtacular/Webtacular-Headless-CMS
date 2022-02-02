import { ObjectId } from "mongodb";
import { ErrorInterface, RoleInterface, UserInterface } from "../interfaces";
import { get as get_role, update as update_role, add as add_role, remove as remove_role, removeID, addID } from "./src/manageRole";
import { get as get_user, has as user_has, add as user_add, remove as user_remove } from "./src/manageUser";
import { get as get_precedence, set as set_precedence, remove as remove_precedence, validateDB } from "./src/managePrecedence";
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
    add(role: RoleInterface, returnError?: boolean): Promise<boolean | RoleInterface | ErrorInterface>;
    remove(role: ObjectId, returnError?: boolean): Promise<boolean | ErrorInterface>;
    get(role:ObjectId | ObjectId[], filter?:any, returnError?: boolean): Promise<RoleInterface[]>;
    update(role: ObjectId, new_role: RoleInterface, returnError?: boolean): Promise<boolean | ErrorInterface>;
    addID(role: ObjectId, id: ObjectId, returnError?: boolean): Promise<boolean | ErrorInterface>;
    removeID(role: ObjectId, id: ObjectId, returnError?: boolean): Promise<boolean | ErrorInterface>;
    gql():any;
}

export const role:RoleExportInterface = {
    add: (role: RoleInterface, returnError?: boolean): Promise<boolean | RoleInterface | ErrorInterface> => add_role(role, returnError),
    remove: (role: ObjectId, returnError?: boolean): Promise<boolean | ErrorInterface> => remove_role(role, returnError),
    update: (role: ObjectId, new_role: RoleInterface, returnError?: boolean): Promise<boolean | ErrorInterface> => update_role(role, new_role, returnError),
    get: (role:ObjectId | ObjectId[], filter?:any, returnError?: boolean): Promise<RoleInterface[]> => get_role(role, filter),
    addID: (role: ObjectId, id: ObjectId, returnError?: boolean): Promise<boolean | ErrorInterface>=> addID(role, id, returnError),
    removeID: (role: ObjectId, id: ObjectId, returnError?: boolean): Promise<boolean | ErrorInterface> => removeID(role, id, returnError),
    gql: ():any => graphql.expand(__dirname, 'gql/schema.gql', rootFuncs)
}

//---------------------------------//


//--------[  User exports ]--------//

interface UserExportInterface {
    get(user: UserInterface | ObjectId, returnError?: boolean):Promise<RoleInterface[] | ErrorInterface | boolean>;
    has(user: UserInterface | ObjectId, role:ObjectId[] | ObjectId, returnError?: boolean):Promise<boolean | ErrorInterface | { [key: string]: boolean; }>;
    add(user: ObjectId, role: ObjectId, returnError?:boolean):Promise<boolean | ErrorInterface>;
    remove(user: ObjectId, role: ObjectId, returnError?: boolean):Promise<boolean | ErrorInterface>;
}

export const user:UserExportInterface = {
    get: (user: UserInterface | ObjectId, returnError?: boolean):Promise<RoleInterface[] | ErrorInterface | boolean> => get_user(user, returnError),
    has: (user: UserInterface | ObjectId, role:ObjectId[] | ObjectId, returnError?: boolean):Promise<boolean | ErrorInterface | { [key: string]: boolean; }> => user_has(user, role, returnError),
    add: (user: ObjectId, role: ObjectId, returnError?:boolean):Promise<boolean | ErrorInterface> => user_add(user, role, returnError),
    remove: (user: ObjectId, role: ObjectId, returnError?: boolean):Promise<boolean | ErrorInterface> => user_remove(user, role, returnError),
}

//---------------------------------//


//------[ precedence exports ]-----//

interface PrecedenceInterface { 
    set(role: ObjectId, precedence: number, returnError?: boolean): Promise<boolean | ErrorInterface | ObjectId[]>;
    get(returnError?: boolean): Promise<boolean | ErrorInterface | ObjectId[]>;
    remove(role: ObjectId, returnError?: boolean): Promise<boolean | ErrorInterface | ObjectId[]>;
    validateDB(): Promise<void>;
}

export const precedence:PrecedenceInterface = {
    set: (role: ObjectId, precedence: number, returnError?: boolean): Promise<boolean | ErrorInterface | ObjectId[]> => set_precedence(role, precedence, returnError),
    get: (returnError?: boolean): Promise<boolean | ErrorInterface | ObjectId[]> => get_precedence(returnError),
    remove: (role: ObjectId, returnError?: boolean): Promise<boolean | ErrorInterface | ObjectId[]> => remove_precedence(role, returnError),
    validateDB: (): Promise<void> => validateDB(),
}

//---------------------------------//


//TODO: Get role details from cache and only refresh the cache if the role has changed or at the start of the server