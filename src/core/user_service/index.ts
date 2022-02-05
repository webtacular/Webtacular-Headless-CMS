//---------[ USER FUNCTIONS ]---------//

import { ObjectId } from "mongodb";
import { graphql } from "../../api/";
import { ErrorInterface, SingupInterface, UserInterface } from "../interfaces";
import { rootMutators, rootResolvers } from "./gql/graphQL";

interface UserFunctions {
    get: (id:ObjectId | ObjectId[], filter?:any) => Promise<UserInterface[]>;
    update: (id:ObjectId, new_user:any, returnError?:boolean) => Promise<UserInterface | boolean | ErrorInterface>;
    create: (user:SingupInterface, returnError?:boolean) => Promise<UserInterface | boolean | ErrorInterface>;
    gql: () => void;
}

export let user:UserFunctions = {
    get: (id:ObjectId | ObjectId[], filter?:any):Promise<UserInterface[]> => require("./src/get").default(id, filter),
    update: (id:ObjectId, user:any, returnError?:boolean):Promise<UserInterface | boolean | ErrorInterface> => require("./src/update").default(id, user, returnError),
    create: (user:SingupInterface, returnError?:boolean):Promise<UserInterface | boolean | ErrorInterface> => require("./src/create").default(user, returnError),
    gql: () => graphql.expand(__dirname, 'gql/schema.gql', rootResolvers, rootMutators)
};

//---------------------------------------//
