import { ObjectId } from "mongodb";
import { FastifyInstance } from "fastify";
import { current_addons } from "./src/scan";
import { AddonInterface, ErrorInterface } from "../interfaces";
import get from "./src/get";
import start from "./src/load";


//--------[ Exports ]--------//
interface AddonService { 
    start(app:FastifyInstance):void;
    get(id:string | ObjectId, returnErrorKey?:boolean):AddonInterface | boolean | ErrorInterface;
    addons:AddonInterface[];
}

export const addons:AddonService = {
    start: (app:FastifyInstance) => start(app),
    get: (id:string | ObjectId, returnErrorKey?:boolean):AddonInterface | boolean | ErrorInterface => get(id, returnErrorKey),
    addons: current_addons,
}