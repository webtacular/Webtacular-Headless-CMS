import { ObjectId } from "mongodb";
import { mongoDB } from "../../db_service";
import { ErrorInterface, UserInterface } from "../../interfaces";
import { locals } from "../../response_handler";

export default async function (user_id:ObjectId, returnErrorKey?:boolean):Promise<UserInterface | ErrorInterface | boolean> {
    // validate user_id
    if(ObjectId.isValid(user_id) !== true){
        if(returnErrorKey === true) return {
            local_key: locals.KEYS.INVALID_ID,
        } as ErrorInterface;

        return false;
    }

    // The object to find in the database
    let mongoDBfindOBJ:any = {
        _id: new ObjectId(user_id)
    }

    return new Promise((resolve:any) => {
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.user_collection).findOne(mongoDBfindOBJ, async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if (err) {
                if(returnErrorKey === true) return resolve({
                    local_key: locals.KEYS.DB_ERROR,
                    where: 'update.ts',
                    message: err.message
                } as ErrorInterface);

                return resolve(false);
            }

            //----------[ No user found ]----------//

            // If we cant find the user, return a 404
            if (!result) {
                if(returnErrorKey === true) return resolve({
                    local_key: locals.KEYS.USER_NOT_FOUND,
                } as ErrorInterface);

                return resolve(false);
            }

            //----------[ User found ]----------//
            
            // If we found the user, return the user object
            resolve(result);
        });
    });
}