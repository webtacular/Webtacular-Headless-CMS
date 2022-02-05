import ipaddr from 'ipaddr.js';
import { ObjectId } from 'mongodb';
import { ErrorInterface, IPhistoryInterface } from './interfaces';
import { mongoDB } from './db_service';
import { getTimeInSeconds } from './general_service';
import { locals } from './response_handler';

/**
 * Gets the ip from a express request object, parses it and than returns it as B64
 * 
 * @param req Express request object
 * @returns string - Base64 encoded IP
 */
export function getIP(req:any):string {
    let ip = req?.headers?.includes('cf-connecting-ip') !== undefined ? req?.headers['cf-connecting-ip'] : req?.ip;
    console.log(req.ip);    
    return ipaddr.parse(ip).toString();
}

/**
 * Checks the history for a specific IP and returns the last timestamp, users, etc
 * 
 * @param ip string - IP
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * @returns Promise<IPhistoryInterface | boolean | ErrorInterface> - Promise with the IP history or false if not found
*/
export async function checkIPlogs(ip:string, returnError?:boolean):Promise<IPhistoryInterface | boolean | ErrorInterface> {
    return new Promise((resolve, reject) => {
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.ip_collection).findOne({ ip } as any, (err:any, result:any) => {
            if (err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: err.message,
                    where: 'ip_service.checkIPlogs()',
                } as ErrorInterface);

                return reject(false);
            }

            if(!result) {
                if(returnError === true) return reject({
                    code: 1,
                    local_key: locals.KEYS.NOT_FOUND,
                    message: locals.KEYS.NOT_FOUN,
                    where: 'ip_service.checkIPlogs()',
                } as ErrorInterface);

                return reject(false);
            }

            resolve(result as IPhistoryInterface)
        }); 
    });
}

/**
 * This function will add an IP history object to the database
 * 
 * @param ip - the ip to be added to the database
 * @param user_id - the user id to be added to the database
 * @param returnError boolean - if true and the func errors, it returns an ErrorInterface object, if false a boolean will be returned
 * @returns Promise<boolean | ErrorInterface> - if true, the ip is added to the database, if false, the ip is not added to the database
 */
export async function logIP(ip:string, user_id:ObjectId, returnError?:boolean):Promise<IPhistoryInterface | boolean | ErrorInterface> {
    let res = await checkIPlogs(ip, true).catch(err => {
        if(err.code === 0) throw err;
    });      

    // Never seen this IP before, create a new entry
    if((res as ErrorInterface)?.message === locals.KEYS.NOT_FOUND)
        return log_new(ip, user_id, returnError);

    // We have seen this IP before, update it
    else return log_old(ip, user_id, res as IPhistoryInterface, returnError);
}

let log_new = async (ip:string, id:ObjectId, returnError?:boolean):Promise<IPhistoryInterface | boolean | ErrorInterface> => {
    return new Promise((resolve, reject) => {

        // Create the new IP object
        let ipOBJ:IPhistoryInterface = {
            _id: new ObjectId(),
            last_accessed: getTimeInSeconds(),
            created: getTimeInSeconds(),
            count: 1,
            banned: false,
            ip,
            settings: {
                bypass_acc_limit: false,
                bypass_timeout: false,
            },
            accounts: [
                {
                    user_id: id,
                    timestamp: getTimeInSeconds()
                }
            ]
        }
    
        // Attempt to insert the new ip
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.ip_collection).insertOne(ipOBJ as any, (err:any, result:any) => {
            
            // In the event of an error, return the error
            if (err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: err.message,
                    where: 'ip_service.checkIPlogs()',
                } as ErrorInterface);
    
                return reject(false);
            }
            
            // If we were successful, return the object
            resolve(result as IPhistoryInterface)
        });
    });
}

let log_old = async (ip:string, id:ObjectId, ip_history:IPhistoryInterface, returnError?:boolean):Promise<IPhistoryInterface | boolean | ErrorInterface> => {
    return new Promise((resolve, reject) => {
        
        // Create the new IP history object
        Object.assign(ip_history, {
            last_accessed: getTimeInSeconds(),
            count: ++ip_history.count,
            accounts: [...ip_history.accounts,
                {
                    user_id: id,
                    timestamp: getTimeInSeconds()
                }
            ]
        });
        
        let mongoDBfindOBJ:any = {
            _id: ip_history._id
        }
        
        // Attempt to update the ip history
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.ip_collection).findOneAndUpdate(mongoDBfindOBJ, { $set: ip_history } as any, (err:any, result:any) => {
            
            // If an error occured, return it
            if (err) {
                if(returnError === true) return reject({
                    code: 0,
                    local_key: locals.KEYS.DB_ERROR,
                    message: err.message,
                    where: 'ip_service.logSameIP()',
                } as ErrorInterface);
    
                return reject(false);
            }
            
            // If data is updated, return the updated data
            resolve(result as IPhistoryInterface)
        });
    });
}