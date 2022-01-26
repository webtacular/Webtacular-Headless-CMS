import { AddonInterface } from '../../interfaces';
import { validateJSON } from './validate';
import { join } from 'path';

const fs = require('fs');

export let current_addons:AddonInterface[] = [];

export let scanAddonDir = (path:string) => {
    // get all the folders in the directory
    let folders = fs.readdirSync(path);

    // loop through the folders
    folders.forEach((folder_path:string) => {
        // Join the path with the folder name
        folder_path = join(path, folder_path);

        // Check if the directory is a folder
        if(fs.lstatSync(folder_path).isDirectory() !== true)
            return;

        // check if the folder has a config.json file
        if(fs.existsSync(join(folder_path, 'config.json')) !== true)
            return;
        
        // read the config.json file
        let json:string = fs.readFileSync(join(folder_path, 'config.json'), 'utf8'),
            addon:AddonInterface | Error = validateJSON(json, folder_path);

        // Log any errors
        if (addon instanceof Error) 
            throw console.error('[error loading addon] ', addon.message, folder_path);

        else addon = addon as AddonInterface;

        // Add the addon to the addon list
        current_addons.push(addon);
    });
}