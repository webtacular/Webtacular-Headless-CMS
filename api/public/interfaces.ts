import { ObjectId } from "mongodb";

export interface RouterCallback {
    (req: any, res: any, resources:Array<string>): void;
}

export interface MethodsInterface {
    GET: RouterCallback; 
    POST: RouterCallback;
    DELETE: RouterCallback;
    PUT: RouterCallback;
}

export interface ResourceInterface {
    GET?: Array<string>;
    POST?: Array<string>;
    DELETE?: Array<string>;
    PUT?: Array<string>;
}

export let isResourceInterface = (obj: any):boolean => { 
    return Object.keys(obj as ResourceInterface).some((method:string) => ['GET', 'POST', 'DELETE', 'PUT'].includes(method));
}

//
// Database interfaces
//
export interface IpInterface {
    _id?: ObjectId | string;
    ip: string;
    last_accessed: number;
    accounts: { user_id:string, timestamp:number }[];
}

export interface UserInterface {
    _id?: ObjectId | string;

    user_name: string;
    email: string;
    password: string;
    language?: string;

    previous_info: {
        user_name: {
            previous: string;
            timestamp: number;
        }[];
        email: {
            previous: string;
            timestamp: number;
        }[];
        password: {
            previous: string;
            timestamp: number;
        }[];
    };

    security_info: {
        signup_ip: string;
        attempts: number;
        last_login: number;
        email_verified: boolean;
        last_email: number;
        account_creation: number;
        account_lock: boolean;
        
        trusted_devices?: {
            ip: string;
            creation: number;
            expiration: number;
            user_agent: string;
            trusted_token: string;
        }[];

        login_attempts?:{
            ip: string;
            timestamp: number;
            user_agent: string;
            succsess: boolean;
        }[];
    };
};

//this is wraped in a function so that we can just call it
//and edit the object without having to clone it.
export let UserInterfaceTemplate = (): UserInterface => {
    return {
        user_name: '',
        email: '',
        password: '',
        language: 'EN',
        
        previous_info: {
            user_name: [],
            email: [],
            password: [],
        },

        security_info: {
            last_login: Date.now(),
            signup_ip: '',
            account_lock: false,
            attempts: 0,
            last_email: Date.now(),
            account_creation: Date.now(),
            email_verified: false,
            trusted_devices: [],
            login_attempts: [],
        }
    };
}

export interface AuthCollection {
    ip_collection: string;
    user_collection: string;
    accounts_per_ip: number;
    new_account_timeout: number;
}