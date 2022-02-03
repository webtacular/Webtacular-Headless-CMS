import { AddonInterface, ContentInterface, ErrorInterface } from "../interfaces";
import { ObjectId } from "mongodb";
import create from "./src/crud/create";
import update from "./src/crud/update";
import read from "./src/crud/read";

export const content = {
    create: (addon:AddonInterface, type:string, content:{ content:any, owner?:ObjectId }, returnError?: boolean): Promise<boolean | ErrorInterface | ContentInterface> => 
        create(addon, type, content, returnError),
        
    read: (post_id:ObjectId | ObjectId[], filter?:any, returnError?:boolean): Promise<boolean | ErrorInterface | ContentInterface[]> => 
        read(post_id, filter, returnError),

    update: (post_id:ObjectId, content:{ content:any, owner?:ObjectId }, returnError?:boolean): Promise<boolean | ErrorInterface | ContentInterface> => 
        update(post_id, content, returnError)
}