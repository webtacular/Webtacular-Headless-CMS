//---------[ USER FUNCTIONS ]---------//

import { ObjectId } from "mongodb";
import { ErrorInterface, UserInterface } from "../interfaces";

interface UserFunctions {
    get: (id:ObjectId, returnErrorKey?:boolean, res?:any) => Promise<UserInterface | boolean | ErrorInterface>;
    update: (id:ObjectId, user:UserInterface, returnErrorKey?:boolean, res?:any) => Promise<UserInterface | boolean | ErrorInterface>;
    create: (user:UserInterface, res?:any) => Promise<UserInterface | boolean | ErrorInterface>;
}

export let user:UserFunctions = {
    get: (id:ObjectId, returnErrorKey?:boolean, res?:any):Promise<UserInterface | boolean | ErrorInterface> => require("./src/get").default(id, returnErrorKey, res),
    update: (id:ObjectId, user:UserInterface, returnErrorKey?:boolean, res?:any):Promise<UserInterface | boolean | ErrorInterface> => require("./src/update").default(id, user, returnErrorKey, res),
    create: (user:UserInterface, returnErrorKey?:boolean, res?:any):Promise<UserInterface | boolean | ErrorInterface> => require("./src/user").default(user, returnErrorKey, res)
};

//---------------------------------------//
