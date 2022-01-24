import { localDB } from "../db_service";
import { JsonDB } from 'node-json-db';
import { ObjectId } from "mongodb";
import { ErrorInterface, RoleInterface, UserInterface } from "../interfaces";
import { get as get_role, add as add_role, remove as remove_role, removeID, addID } from "./src/manageRole";
import { get as get_user, has as user_has, add as user_add, remove as user_remove } from "./src/manageUser";
import { get as get_perm, has as perm_has } from "./src/managePerms";

export let loaded:boolean = false,
    db_name:string = 'role_db',
    permissions: Array<string> = [],
    precedence: { [key: number]:string } = {},
    roles:{ [key:string]:RoleInterface } = {};

// this function is used to load the permissions, role precedence and the database
export function load() {
    // Create/load the DB
    let db:JsonDB = localDB.addDB(db_name);

    // push an empty array to the permissions,
    // just incase the database is empty
    db.push('/permissions', [], false);

    // Get the permissions data
    permissions = db.getData('/permissions');


    // push an empty object to the precedence,
    // just incase the database is empty
    db.push('/precedence', {}, false);

    // Get the precedence data
    precedence = db.getData('/precedence');


    // push an empty object to the roles,
    // just incase the database is empty
    db.push('/roles', {}, false);

    // Get the precedence data
    roles = db.getData('/roles');
}

//--------[ Value exports ]--------//

interface ValueInterface {
    permissions: Array<string>;
    precedence: { [key: number]:string };
    roles: { [key:string]:RoleInterface };
}

export const values:ValueInterface = {
    permissions,
    precedence,
    roles,
}

//--------------------------------//


//--------[ Role exports ]--------//

interface RoleExportInterface {
    add(role: RoleInterface, returnErrorKey?: boolean): boolean | ErrorInterface;
    remove(role_name: string, returnErrorKey?: boolean): boolean | ErrorInterface;
    get(name: string): RoleInterface | false;
    addID(role_name: string, id: ObjectId, returnErrorKey?: boolean): boolean | ErrorInterface;
    removeID(role_name: string, id: ObjectId, returnErrorKey?: boolean): boolean | ErrorInterface;
}

export const role:RoleExportInterface = {
    add: (role: RoleInterface, returnErrorKey?: boolean): boolean | ErrorInterface => add_role(role, returnErrorKey),
    remove: (role_name: string, returnErrorKey?: boolean): boolean | ErrorInterface => remove_role(role_name, returnErrorKey),
    get: (name: string): RoleInterface | false => get_role(name),
    addID: (role_name: string, id: ObjectId, returnErrorKey?: boolean): boolean | ErrorInterface => addID(role_name, id, returnErrorKey),
    removeID: (role_name: string, id: ObjectId, returnErrorKey?: boolean): boolean | ErrorInterface => removeID(role_name, id, returnErrorKey),
}

//---------------------------------//


//--------[  User exports ]--------//

interface UserExportInterface {
    get(user: UserInterface | ObjectId, returnErrorKey?: boolean):Promise<RoleInterface[] | ErrorInterface | boolean>;
    has(user: UserInterface | ObjectId, role:string, returnErrorKey?: boolean):Promise<boolean | ErrorInterface>;
    add(user: ObjectId, role:string, returnErrorKey?:boolean):Promise<boolean | ErrorInterface>;
    remove(user: ObjectId, role:string, returnErrorKey?: boolean):Promise<boolean | ErrorInterface>;
}

export const user:UserExportInterface = {
    get: (user: UserInterface | ObjectId, returnErrorKey?: boolean):Promise<RoleInterface[] | ErrorInterface | boolean> => get_user(user, returnErrorKey),
    has: (user: UserInterface | ObjectId, role:string, returnErrorKey?: boolean):Promise<boolean | ErrorInterface> => user_has(user, role, returnErrorKey),
    add: (user: ObjectId, role:string, returnErrorKey?:boolean):Promise<boolean | ErrorInterface> => user_add(user, role, returnErrorKey),
    remove: (user: ObjectId, role:string, returnErrorKey?: boolean):Promise<boolean | ErrorInterface> => user_remove(user, role, returnErrorKey),
}

//---------------------------------//


//--------[  perm exports ]--------//

interface PermExportInterface {
    has(user: UserInterface | ObjectId, role:string, returnErrorKey?: boolean):Promise<boolean | ErrorInterface>;
    get(role: string, returnErrorKey?: boolean):Array<string> | ErrorInterface | boolean;
}

export const perm:PermExportInterface = {
    has: (user: UserInterface | ObjectId, role:string, returnErrorKey?: boolean):Promise<boolean | ErrorInterface> => perm_has(user, role, returnErrorKey),
    get: (role: string, returnErrorKey?: boolean):Array<string> | ErrorInterface | boolean => get_perm(role, returnErrorKey),
}

//---------------------------------//
