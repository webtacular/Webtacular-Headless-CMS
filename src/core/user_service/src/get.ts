import { ObjectId } from "mongodb";
import { mongoDB } from "../../db_service";
import { ErrorInterface, UserGetInterface, UserInterface } from "../../interfaces";
import { locals, returnLocal } from "../../response_handler";

export default async function (user_id:ObjectId | ObjectId[], returnErrorKey?:boolean):Promise<UserGetInterface | ErrorInterface | boolean> {
    
    // check if the user_id is an array, if not, make it an array
    if((user_id as ObjectId[])?.length === undefined)
        user_id = [user_id] as ObjectId[];

    // make sure the user_id is an array of ObjectIds type
    else user_id = user_id as ObjectId[];


    // validate user_id
    user_id.forEach((id:ObjectId) => {
        if(ObjectId.isValid(id) !== true) {
            if(returnErrorKey === true) return {
                local_key: locals.KEYS.INVALID_ID,
                message: returnLocal('INVALID_ID'),
                where: id.toString(),
            } as ErrorInterface;
    
            return false;
        }
    });

    // The object to find in the database
    let mongoDBfindOBJ:any = {
        _id: { $in: user_id }
    }

    // get the users from the database
    let result:any = await mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.user_collection).find(mongoDBfindOBJ).toArray();

    // return the users
    return result;
}