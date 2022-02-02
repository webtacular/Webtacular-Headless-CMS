import { graphql } from "../../api";
import { ObjectId } from "mongodb";
import { rootFuncs } from "./gql/graphQL";
import { FastifyInstance } from "fastify";
import { current_addons } from "./src/scan";
import { AddonInterface, ErrorInterface } from "../interfaces";
import get from "./src/get";
import start from "./src/load";


//--------[ Exports ]--------//
interface AddonService { 
    start(app:FastifyInstance):void;
    get(id:string | ObjectId, returnError?:boolean):AddonInterface | boolean | ErrorInterface;
    addons:AddonInterface[];
    gql: () => void;
}

export const addons:AddonService = {
    start: (app:FastifyInstance) => start(app),
    get: (id:string | ObjectId, returnError?:boolean):AddonInterface | boolean | ErrorInterface => get(id, returnError),
    addons: current_addons,
    gql: () => graphql.expand(__dirname, 'gql/schema.gql', rootFuncs)
}