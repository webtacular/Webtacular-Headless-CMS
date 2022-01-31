import { ObjectId } from "mongodb";
import {mongoDB} from "../../../db_service";
import { AddonInterface, ContentInterface, ErrorInterface } from "../../../interfaces";
import { locals, mongoErrorHandler } from "../../../response_handler";
import { user } from "../../../user_service";

/**
 * This function is used to add content to the database, only used by plugins.
 * content is stored as follows:
 * {
 *    _id: ObjectId | string;
 *    addon_id: ObjectId | string;
 *    type: string;
 *    owner?: ObjectId | string;
 *    history: {content: any, owner: ObjectId | string, date: Date, reason: string}[];
 *    content: any;
 * }
 * 
 * owner is optional, if it is not set, it will be left undefined, else it has to be a valid users id, them being the owner of the content allows them to modify it.
 * content: this is where the plugins data is stored, the rest is just metadata;
 * 
 * @param addon - The details of the addon trying to create content
 * @param type - The type of content to create, has to be a type defined in the addon json
 * @param returnErrorKey - If true, the function will return an error object instead of a boolean
 * @param content - The content to create { content: any, owner?: ObjectId }, content can be anything, while the owner is either undefined or a valid user BSON ID, or else it will be ignored
 */
export default async function(addon:AddonInterface, type:string, content:{ content:any, owner?:ObjectId }, returnErrorKey?: boolean): Promise<boolean | ErrorInterface | ContentInterface> {
    // Validate that the type is valid
    if(!addon.types.includes(type)) {
        if(returnErrorKey === true) return {
            local_key: locals.KEYS.INVALID_TYPE,
            where: 'create.ts',
            message: `The type ${type} is not defined in the addon ${addon.name}`
        } as ErrorInterface;

        return false;
    }


    // Start creating the content
    let pushOBJ:ContentInterface = {
        _id: new ObjectId(),
        addon_id: new ObjectId(addon.id),
        type: type.toLowerCase(),
        history: [],
        content: content.content,
    };

    // If the owner is set, set it
    if(content?.owner !== undefined) {
        // Validate that the owner is valid
        if(ObjectId.isValid(content.owner) !== true) {
            if(returnErrorKey === true) return {
                local_key: locals.KEYS.INVALID_ID,
                where: 'create.ts',
                message: `The owner ${content.owner} is not a valid BSON ID`
            } as ErrorInterface;
            else return false;
        }

        else pushOBJ.owner = new ObjectId(content.owner);
    }
    

    // try to insert the content into the database
    return new Promise(async(resolve:any) => {
        // Check if an owner was set, if so we need to update the user
        if(pushOBJ.owner !== undefined) {
            // Get the user
            let user_data:any = await user.get(pushOBJ.owner, { content: 1 }, returnErrorKey);

            // Check if the user exists
            if(user_data === false || user_data.message !== undefined || user_data[0] === undefined){
                if(returnErrorKey === true) return resolve({
                    local_key: locals.KEYS.INVALID_ID,
                    where: 'create.ts',
                    message: `The owner ${content.owner} is not found`
                }) as ErrorInterface;

                else return resolve(false);
            } 


            // Add the content to the user
            let new_user:any = user.update(pushOBJ.owner, { content: [...user_data.content || [], pushOBJ._id] }, returnErrorKey);

            // make sure the user was updated and not an error
            if(new_user === false || new_user.message !== undefined)
                return resolve(new_user);
        }


        await mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.content_collection).insertOne(pushOBJ as any, (err:any, result:any) => {
            if (err) {
                if(returnErrorKey === true) return resolve({
                    local_key: locals.KEYS.DB_ERROR,
                    where: 'update.ts',
                    message: err.message
                });

                return resolve(false);
            }

            // if the content was added, return the content
            return resolve(pushOBJ);
        });
    });
}