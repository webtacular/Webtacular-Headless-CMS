/*
    LOGIN > | 
            | OAUTH2 > | 
            |          | old user > |
            |          |            | Find the user and log them in
            |          |
            |          | New user > |
            |                       |  email already exists > |
            |                       |                         | force them to login with their password to link their account
            |                       |
            |                       |  new email -----------> |
            |                                                 | Create the account with the oauth2 info
            |                                                 | make them create a password else delete the account
            |
            |
            | EMAIL/PASS/USERNAME > |
            |                       | Find user, compare password hashes, return user
            |
            |
            | SMS > |
                    | Find user, compare password hashes, return user
*/

//---------[ USER FUNCTIONS ]---------//

import { ObjectId } from "mongodb";
import { graphql } from "../../api/";
import { EmailContentInterface, ErrorInterface, SingupInterface, UserInterface } from "../interfaces";
import { rootResolvers } from "./gql/graphQL";

interface UserFunctions {
    get: (id:ObjectId | ObjectId[], filter?:any) => Promise<UserInterface[]>;
    update: (id:ObjectId, new_user:any, returnError?:boolean) => Promise<UserInterface | boolean | ErrorInterface>;
    create: (user:SingupInterface, returnError?:boolean) => Promise<UserInterface | boolean | ErrorInterface>;
    setEmailHandler: (func:(content:EmailContentInterface, email:string, returnError?:boolean) => Promise<UserInterface | boolean | ErrorInterface>) => void;
    gql: () => void;
}

export let user:UserFunctions = {
    get: (id:ObjectId | ObjectId[], filter?:any):Promise<UserInterface[]> => require("./src/get").default(id, filter),
    update: (id:ObjectId, user:any, returnError?:boolean):Promise<UserInterface | boolean | ErrorInterface> => require("./src/update").default(id, user, returnError),
    create: (user:SingupInterface, returnError?:boolean):Promise<UserInterface | boolean | ErrorInterface> => require("./src/create").default(user, returnError),
    setEmailHandler: (func:(content:EmailContentInterface, email:string, returnError?:boolean) => Promise<UserInterface | boolean | ErrorInterface>) => require("./src/setEmailHandler").default(func),
    gql: () => graphql.expand(__dirname, 'gql/schema.gql', rootResolvers)
};

//---------------------------------------//
