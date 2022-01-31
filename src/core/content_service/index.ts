import { AddonInterface, ContentInterface, ErrorInterface } from "../interfaces";
import { ObjectId } from "mongodb";
import create from "./src/crud/create";

export const content = {
    create: (addon:AddonInterface, type:string, content:{ content:any, owner?:ObjectId }, returnErrorKey?: boolean): Promise<boolean | ErrorInterface | ContentInterface> => create(addon, type, content, returnErrorKey)
}