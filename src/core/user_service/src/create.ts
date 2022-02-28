import { mongoDB } from "../../db_service";
import { getTimeInSeconds } from "../../general_service";
import { hashString } from "../../hashing_service";
import { ErrorInterface, SingupInterface, TokenInterface, UserInterface, UserInterfaceTemplate } from "../../interfaces";
import { checkIPlogs, logIP } from "../../ip_service";
import { userRegex } from "../../regex_service";
import { locals, mongoErrorHandler, returnLocal } from "../../response_handler";
import { generateToken } from "../../token_service";

/**
 * this function is used to create a user in the database
 * 
 * @param user UserInterface - The user object to create
 * @returns Promise<UserInterface | ErrorInterface> - The user object or the error key
 */
export default async function (user:SingupInterface):Promise<UserInterface | ErrorInterface> {
    return new Promise(async(resolve:any, reject:any) => {
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
            if(!tests[i].RegExp.test(tests[i].value)) return reject({
                code: 1,
                local_key: tests[i].error,
                message: returnLocal(tests[i].error),
                where: 'user_service.create',              
            } as ErrorInterface);
        }

        // Hash the password
        user.password = await hashString(user.password, global.__CONFIG__.security.password.salt_rounds).catch(err => {
            return reject(err);
        });

        // if we made it this far, we can create the user
        // TODO: Make it so we asign the user the default role, after we create a setup function
        let userObject:UserInterface = UserInterfaceTemplate();

        // Merge the two objects
        Object.assign(userObject, user);

        // log the IP
        (await logIP(user.ip, userObject._id, undefined).catch(err => {
            return reject(err);
        }));

        // Check logs
        let ipHistory = await checkIPlogs(user.ip).catch(err => { return reject(err); });

        // Check if this IP has reached the limit of allowed accounts
        if(ipHistory?.settings?.bypass_account_limit === false && ipHistory.count >= global.__CONFIG__.security.) return reject({
            code: 1,
            local_key: locals.KEYS.IP_ACCOUNT_LIMIT_REACHED,
            message: returnLocal(locals.KEYS.IP_ACCOUNT_LIMIT_REACHED),
            where: 'user_service.create',
        } as ErrorInterface);
        

        // Check if this IP has reached the timeout
        if(ipHistory?.settings?.bypass_timeout === false && ipHistory.last_accessed + global.__CONFIG__.security.ip.timeout > getTimeInSeconds()) return reject({
            code: 1,
            local_key: locals.KEYS.IP_TIMEOUT_REACHED,
            message: returnLocal(locals.KEYS.IP_TIMEOUT_REACHED, undefined, { 0: (ipHistory.last_accessed + global.__CONFIG__.security.ip.timeout) - getTimeInSeconds() }),
            where: 'user_service.create',
        } as ErrorInterface);

        // Check if this IP has been banned
        if(ipHistory.banned === true) return reject({
            code: 1,
            local_key: locals.KEYS.IP_BANNED,   
            message: returnLocal(locals.KEYS.IP_BANNED),            
            where: 'user_service.create',
        } as ErrorInterface);

        // If the IP passes all the checks, we can create the user and log the IP  
        (await logIP(user.ip, userObject._id, undefined).catch(err => {
            return reject(err);
        }));
        
        // add the users signup IP to the user object
        userObject.registration.ip = user.ip;

        // remove the IP from the root of the user object
        delete (userObject as any).ip;    

        // create the user
        mongoDB.getClient(global.__MONGO_DB__, global.__COLLECTIONS__.user).insertOne((userObject as any), async(err:any, result:any) => {
            // If the DB throws an error, pass it to the error handler
            if(err) return reject(mongoErrorHandler(err.code, err.message));

            // Generate a token for the user
            let token = (await generateToken(result.insertedId).catch(err => {
                return reject({
                    code: 1,
                    local_key: locals.KEYS.TOKEN_GENERATION_FAILED, 
                    message: returnLocal(locals.KEYS.TOKEN_GENERATION_FAILED),
                    where: 'user_service.create',
                });
            }) as TokenInterface);

            // sendEmail({
            //     subject: 'Please confirm your email',
            //     body: user.email,  
            // }, user.email);

            // if the user was created, return the user object 
            resolve({
                token: token.combined,
                user: userObject,
            });
        });
    });
}