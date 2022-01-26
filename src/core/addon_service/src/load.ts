//TODO: We need to check if the there are addons with the same names and types

import { FastifyInstance } from "fastify";
import { AddonInterface } from "../../interfaces";
import { current_addons } from "./scan";


/** 
 * This function is used to call the main function of the addon
 * 
 * @param app the fastify instance
 */
export let start = (app:FastifyInstance):void => {
    let names:string[] = [],
        id:string [] = [],
        funcs:Function[] = [];

    // Get all the names of the addons
    Object.keys(current_addons).forEach((addon: string | AddonInterface, i: number) => {
        // make sure the addon is an instance of AddonInterface
        addon = current_addons[i] as AddonInterface;

        // Check if an addon with the same name exists
        if(names.includes(addon.name))
            throw new Error(`[error loading addon] Addon with the name ${addon.name} already exists`);
        // if not, add it to the names array
        else names.push(addon.name);

        // Check if an addon with the same ID exists
        if(names.includes(addon.id.toString()))
            throw new Error(`[error loading addon] Addon with the ID ${addon.id} already exists`);
        // if not, add it to the ID array
        else names.push(addon.id.toString());

        // Pass its function to the funcs array
        funcs.push(addon.import.main);
    });

    // Loop through all the addons
    funcs.forEach((func:Function) => func(app));
};
