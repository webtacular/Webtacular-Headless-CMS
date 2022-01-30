//---------[ USER FUNCTIONS ]---------//

import { ObjectId } from "mongodb";
import { graphql } from "../../api/";
import { ErrorInterface, UserGetInterface, UserInterface } from "../interfaces";
import { rootFuncs } from "./gql/graphQL";

interface UserFunctions {
    get: (id:ObjectId | ObjectId[], filter?:any, returnErrorKey?:boolean) => Promise<UserGetInterface | boolean | ErrorInterface>;
    update: (id:ObjectId, user:UserInterface, returnErrorKey?:boolean, res?:any) => Promise<UserInterface | boolean | ErrorInterface>;
    create: (user:UserInterface, res?:any) => Promise<UserInterface | boolean | ErrorInterface>;
    gql: () => void;
}

export let user:UserFunctions = {
    get: (id:ObjectId | ObjectId[], filter?:any, returnErrorKey?:boolean):Promise<UserGetInterface | boolean | ErrorInterface> => require("./src/get").default(id, filter, returnErrorKey),
    update: (id:ObjectId, user:UserInterface, returnErrorKey?:boolean, res?:any):Promise<UserInterface | boolean | ErrorInterface> => require("./src/update").default(id, user, returnErrorKey, res),
    create: (user:UserInterface, returnErrorKey?:boolean, res?:any):Promise<UserInterface | boolean | ErrorInterface> => require("./src/user").default(user, returnErrorKey, res),
    gql: () => graphql.expand(__dirname, 'gql/schema.gql', rootFuncs)
};

//---------------------------------------//
