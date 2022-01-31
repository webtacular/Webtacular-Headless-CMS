import { FastifyInstance } from 'fastify';
import {ObjectId} from 'mongodb';
import {checkForToken} from '../../token_service';
import { addons as imported_addons } from '../';
import {AddonInterface} from '../../interfaces';

let getAddonData = (req:any, args:any, id:ObjectId) => {
    // Get the addon data
    let addon_data:any = imported_addons.get(id);

    // Check if the user is an admin
    if((req as any)?.auth?.admin === true)
        return addon_data;

    // if not, Filter and return the data
    return {
        _id: addon_data?._id?.toString(),
        name: addon_data?.name,
        description: addon_data?.description,   
        types: addon_data?.types,
    }
}

let addon = async (args:any, req:FastifyInstance, context:any) => {
    // Check if the request is authenticated
    await checkForToken(req, true);

    // Test the ID
    if(ObjectId.isValid(args?.id) === false)
        return;

    // Make sure the ID is an ObjectId
    let id:ObjectId = new ObjectId(args?.id);

    // Get the addon data
    return getAddonData(req, args, id); 
}

let addons = async (args:any, req:FastifyInstance, context:any) => {
    // Check if the request is authenticated
    await checkForToken(req, true);

    let addon_array:AddonInterface[] = [];
    
    // Get the addon data
    imported_addons.addons.forEach(elem => {
        addon_array = [...addon_array, getAddonData(req, args, new ObjectId(elem.id))];
    });

    return addon_array;
}

export const rootFuncs = {
    addon: (args:any, req:FastifyInstance, context:any) => addon(args, req, context),
    addons: (args:any, req:FastifyInstance, context:any) => addons(args, req, context)
}