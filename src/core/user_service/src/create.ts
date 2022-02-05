import { mongoDB } from "../../db_service";
import { ErrorInterface, SingupInterface, UserInterface, UserInterfaceTemplate } from "../../interfaces";
import { userRegex } from "../../regex_service";
import { locals, returnLocal } from "../../response_handler";

/**
 * this function is used to create a user in the database
 * 
 * @param user UserInterface - The user object to create
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * @returns Promise<UserInterface | boolean | ErrorInterface> - The user object or the error key
 */
export default async function (user:SingupInterface, returnError?:boolean):Promise<UserInterface | boolean | ErrorInterface> {
    return new Promise((resolve:any, reject:any) => {
        // we need to verify the user object

        let tests:{value:string, error: string, RegExp: RegExp}[] = [
            {
                value: user.user_name,
                error: locals.KEYS.USER_NAME_INVALID,
                RegExp: userRegex.user_name,
            },
            {
                value: user.email,
                error: locals.KEYS.EMAIL_INVALID,
                RegExp: userRegex.email,
            },
            {
                value: user.password,
                error: locals.KEYS.PASSWORD_INVALID,
                RegExp: userRegex.password,
            }
        ];

        // loop through the tests
        for(let i = 0; i < tests.length; i++) {
            // if the test fails, return the error
            if(!tests[i].RegExp.test(tests[i].value)) {
                if(returnError === true) return reject({
                    code: 1,
                    local_key: tests[i].error,
                    message: returnLocal(tests[i].error),
                    where: 'user_service.create',              
                } as ErrorInterface);
                
                return reject(false);
            }
        }

        // if we made it this far, we can create the user
        //TODO: Make it so we asign the user the default role, after we create a setup function
        let userObject:UserInterface = UserInterfaceTemplate();

        // Merge the two objects
        Object.assign(userObject, user);

        // Get the IP

        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.user_collection).insertOne((user as any), async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if(err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: returnLocal(locals.KEYS.DB_ERROR),
                    where: 'user_service.create',              
                } as ErrorInterface);
                
                return reject(false);
            }

            // if the user was created, return the user object 
            resolve(result);
        });
    });
}