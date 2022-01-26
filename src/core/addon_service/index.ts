import { FastifyInstance } from "fastify";
import { current_addons } from "./src/scan";

// This is the array of functions that will be called when the server starts
let que:Array<Function> = [];

// This function is used to execute the main function of the addon
export let attatch = (func:Function):void => {
    que.push(func);
};

/** 
 * This function is used to call the main function of the addon
 * 
 * @param app the fastify instance
 */
let start = (app:FastifyInstance):void => {
    que.forEach((func) => func(app));
};

//--------[ Exports ]--------//
export const addons = {
    start: (app:FastifyInstance) => start(app),
    addons: current_addons,
}