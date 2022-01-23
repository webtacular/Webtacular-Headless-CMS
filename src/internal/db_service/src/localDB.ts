import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { LocalDatabasesInterface } from '../';

// Variable that stores our Local Databases.
export let local_databases:LocalDatabasesInterface = {};

/**
 * This function is used to create a Local Database
 * 
 * @param name string - the name of the database to cretaed
 * 
 * @returns JsonDB - the database object
*/
export function addDB(name:string):JsonDB {

    // create the JsonDB config
    let config = new Config(`${__dirname}\\databases\\${name}`, true, false, '/');

    // create the database
    let dataBase = new JsonDB(config);
    
    // add the database to the list of databases
    local_databases[name] = dataBase;

    // return the database
    return dataBase;
}

/**
 * This function is used to get a Local Database
 * 
 * @param name string - the name of the database to get
 * 
 * @returns JsonDB - the database object
*/
export function getDB(name:string):JsonDB {
    return local_databases[name];
}