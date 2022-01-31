import { ObjectID } from "bson";
import { AddonInterface, ErrorInterface } from "../../interfaces";
import { locals, returnLocal } from "../../response_handler";
import { current_addons } from "./scan";

/**
 * This function is used to get details about an addon using its ID or name.
 * 
 * @param id the ID or name of the addon
 * @param returnErrorKey if true, the function will return the error key instead of the addon
 * @returns the addon object, or the error key if 'returnErrorKey' is true
 */
export default (id:ObjectID | string, returnErrorKey?: boolean):boolean | AddonInterface | ErrorInterface => {
    let usingID:boolean = false;

    // Validate ID
    if (id instanceof ObjectID && !ObjectID.isValid(id.toString())) {

        if(returnErrorKey === true) return {
            local_key: locals.KEYS.INVALID_ID,
            message: returnLocal('INVALID_ID'),
            where: id.toString(),
        } as ErrorInterface;

        return false;
    } else {
        // We are looking for an ID
        usingID = true;

        // set the id to a string as you cant store an ObjectID in bson
        id = id.toString();
    }

    // Get the addon
    let found_addon:any; 

    current_addons.forEach((addon:AddonInterface) => {
        if(usingID === true && addon.id === id || addon.name === id)
            found_addon = addon;
    });

    // Return the addon if it exists
    if(found_addon)
        return found_addon;

    // else error out
    if(returnErrorKey === true) return {
        local_key: locals.KEYS.NOT_FOUND,
        message: returnLocal('NOT_FOUND'),
        where: id.toString(),
    } as ErrorInterface;

    return false;       
}