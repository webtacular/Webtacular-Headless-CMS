import { FastifyInstance } from "fastify";
import { AddonInterface } from "../../interfaces";
import { current_addons } from "./scan";

const exportFuncs:{[key:string]:Function} = {
    contact_service: require('../../contact_service'),
    userService: require("../../user_service").user,
    roleService: require("../../role_service"),
    contentService: require("../../content_service").content,
    graphql: require("../../../api").graphql,
    ipService: require("../../ip_service"),
    tokenService: require("../../token_service"),
    databaseService: require("../../db_service"),
    interfaces: require("../../interfaces"),
    responeService: require("../../response_handler"),
    regexService: require("../../regex_service"),
    hashingService: require("../../hashing_service"),
};

/** 
 * This function is used to call the main function of the addon
 * 
 * @param app the fastify instance
 */
export default (app:FastifyInstance):void => {
    let names:string[] = [];

    // Get all the names of the addons
    Object.keys(current_addons).forEach((addon: any, i: number) => {
        let addon_types:{[key:string]:string} = {};

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

        // loop through the types
        addon.types.forEach((type: string) => {
            // Validate the type /^[a-zA-Z0-9]{2,50}/
            if(!(/^[a-z0-9_]{2,50}/).test(type))
                throw new Error(`[error loading addon] Addon with the type ${type} is not valid`);

            // Check if an addon with the same type exists
            if(addon_types[type])
                throw new Error(`[error loading addon] Addon with the type ${type} already exists`);

            // if not, add it to the types array
            addon_types[type] = type;
        });

        // execute the main function of the addon
        addon.import.main(app, exportFuncs, addon, addon_types);
    });
};
