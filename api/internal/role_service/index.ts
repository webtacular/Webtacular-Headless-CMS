import { localDB } from "../db_service";
import { JsonDB } from 'node-json-db';
import { RoleInterface } from "../interfaces";

export let loaded:boolean = false,
    db_name:string = 'role_db',
    permissions: Array<string> = [],
    precedence: { [key: number]:string } = {},
    roles:RoleInterface;

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

    addRole({
        name: 'admin',
        color: '#ff0000',
        permissions: []
    });
    
}

import addRole from "./src/createRole";

