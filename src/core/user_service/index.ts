//---------[ USER FUNCTIONS ]---------//

import { ObjectId } from "mongodb";
import { graphql } from "../../api/";
import { ErrorInterface, UserGetInterface, UserInterface } from "../interfaces";
import { rootMutators, rootResolvers } from "./gql/graphQL";

interface UserFunctions {
    get: (id:ObjectId | ObjectId[], filter?:any) => Promise<UserInterface[]>;
    update: (id:ObjectId, user:any, returnError?:boolean, res?:any) => Promise<UserInterface | boolean | ErrorInterface>;
    create: (user:UserInterface, res?:any) => Promise<UserInterface | boolean | ErrorInterface>;
    gql: () => void;
}

export let user:UserFunctions = {
    get: (id:ObjectId | ObjectId[], filter?:any):Promise<UserInterface[]> => require("./src/get").default(id, filter),
    update: (id:ObjectId, user:any, returnError?:boolean, res?:any):Promise<UserInterface | boolean | ErrorInterface> => require("./src/update").default(id, user, returnError, res),
    create: (user:UserInterface, returnError?:boolean, res?:any):Promise<UserInterface | boolean | ErrorInterface> => require("./src/user").default(user, returnError, res),
    gql: () => graphql.expand(__dirname, 'gql/schema.gql', rootResolvers, rootMutators)
};

//---------------------------------------//
