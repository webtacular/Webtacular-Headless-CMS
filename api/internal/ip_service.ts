import ipaddr from 'ipaddr.js';
import { ObjectId } from 'mongodb';
import { IpInterface } from './interfaces';
import { mongoErrorHandler } from './response_handler';
import { mongoDB } from './db_service';
import { getTimeInSeconds } from './general_service';

/**
 * Gets the ip from a express request object, parses it and than returns it as B64
 * 
 * @param req Express request object
 * @returns string - Base64 encoded IP
 */
export function getIP(req:any):string {
    let ip = req?.headers['cf-connecting-ip'] !== undefined ? req?.headers['cf-connecting-ip'] : req.connection.remoteAddress;
    ip = ipaddr.parse(ip).toString();
    return Buffer.from(ip).toString('base64');
}

export async function checkIPlogs(ip:string, res:any):Promise<IpInterface> {
    return new Promise((resolve:any) => {
        mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.ip_collection, res).findOne({ ip } as any, (err:any, result:any) => {
            if (err) return resolve(mongoErrorHandler(err.code, res));
            resolve(result as IpInterface)
        }); 
    });
}

export async function logNewIP(ip:string, user_id:string, res:any) {
    let ipOBJ:IpInterface = {
        _id: new ObjectId(),
        last_accessed: getTimeInSeconds(),
        count: 1,
        ip,
        settings: {
            bypass_acc_limit: false,
            bypass_timeout: false,
        },
        accounts: [
            {
                user_id: user_id,
                timestamp: getTimeInSeconds()
            }
        ]
    }

    mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.ip_collection, res).insertOne(ipOBJ as any, (err:any, result:any) => {
        if (err) return mongoErrorHandler(err.code, res, JSON.stringify(err.keyPattern));
    });
}

export async function logSameIP(ip_history:any, user_id:string, res:any) {
    Object.assign(ip_history, {
        last_accessed: getTimeInSeconds(),
        count: ++ip_history.count,
        accounts: [...ip_history.accounts,
            {
                user_id: user_id,
                timestamp: getTimeInSeconds()
            }
        ]
    });

    mongoDB.getClient(global.__DEF_MONGO_DB__, global.__AUTH_COLLECTIONS__.ip_collection, res).findOneAndUpdate({ 
        _id: new ObjectId(ip_history._id) 
    }, { $set: ip_history } as any, (err:any, result:any) => {
        if (err) return mongoErrorHandler(err.code, res, JSON.stringify(err.keyPattern));
    });
}