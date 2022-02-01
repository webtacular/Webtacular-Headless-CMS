import { ObjectId } from "mongodb";
import { mongoDB } from "../../db_service";
import { ErrorInterface, UserGetInterface } from "../../interfaces";
import { locals, returnLocal } from "../../response_handler";

export default async function (user_id:ObjectId | ObjectId[], filter?:any, returnErrorKey?:boolean):Promise<UserGetInterface[] | ErrorInterface | boolean> {
    
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

    let mask:any = [
        {
            $match: {
                _id: { $in: user_id },
            }
        }
    ]

    // add the filter if it exists
    if(filter) mask = [...mask, { $project: filter }];

    // get the users from the database
    return await mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.user_collection).aggregate(mask).toArray() as UserGetInterface[];
}