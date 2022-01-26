import { AddonInterface } from "../../interfaces";
import { addonRegex } from "../../regex_service";
import { join } from 'path';
const fs = require('fs');

let emptyObject = ():AddonInterface => {
    return {
        name: '',
        version: '',
        description: '',
        author: '',
        author_email: '',

        entry_point: '',

        update: {
            update_url: '',
            version_url: '',
            changelog_url: '',
        },

        types: [],
        import: '',
    }
}

/**
 * This function validates the addon json
 * 
 * @param json string - The json string to validate
 * @returns AddonInterface - The validated addon or an error object
 */
export let validateJSON = (json:string | any, path:string):AddonInterface | Error => {

    // First, convert the string to a JSON object
    try {
        json = JSON.parse(json);
    } catch(err: any) { return new Error("Invalid Json " + err); }

    // Get an empty template
    let template:AddonInterface = emptyObject();

    // Fill it out  
    Object.assign(template, json);

    // validate the values
    if(!addonRegex.addon_name.test(template.name))
        return new Error("Invalid addon name, please reffer to addonRegex");

    if(!addonRegex.addon_version.test(template.version))
        return new Error("Invalid addon version, please reffer to addonRegex");

    if(!addonRegex.addon_author.test(template.author))   
        return new Error("Invalid addon author, please reffer to addonRegex");

    // get the entry point location
    let entry_point:string = join(path, template.entry_point);
    
    // check if that file exists
    if(fs.existsSync(entry_point) !== true)
        return new Error("Invalid addon entry point");

    // Import the addon
    let imported = require(entry_point);

    // Check if the addon has a valid entry point
    if(!imported?.main)
        return new Error("Invalid addon entry point, no exported main() function please use 'export function main() {}' ");

    // assign the import
    template.import = imported;

    // return the validated addon
    return template;
}
