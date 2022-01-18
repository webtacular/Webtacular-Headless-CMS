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
    if(obj === undefined) return false;
    return Object.keys(obj as ResourceInterface).some((method:string) => ['GET', 'POST', 'DELETE', 'PUT'].includes(method));
}

//
// Database interfaces
//
export interface IpInterface {
    _id?: ObjectId | string;
    ip: string;
    count: number;
    last_accessed: number;
    settings: {
        bypass_timeout: boolean;
        bypass_acc_limit: boolean;
    }
    accounts: { user_id:string, timestamp:number }[];
}

export interface UserInterface {
    _id?: ObjectId | string;

    user_name: string;
    email: string;
    password: string;
    language?: string;

    profile_picture?: string;

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

    permissions: {
        groups: string[];
    }

    security_info: {
        signup_ip: string;
        attempts: number;
        last_login: number;
        email_verified: boolean;
        last_email: number;
        account_creation: number;
        account_locked: boolean;

        tokens?: {
            ip: string;
            creation: number;
            expiration: number;
            user_agent?: string;
            token: string;
        }[];

        login_attempts?:{
            ip: string;
            timestamp: number;
            user_agent?: string;
            succsess: boolean;
        }[];
    };

    blog_info: {
        blogs?: {
            blog_id: ObjectId;
            owner: boolean;
        }[];
        comments?: {
            comment_id: ObjectId;
            blog_id: ObjectId;
        }[];
    }
};

//this is wraped in a function so that we can just call it
//and edit the object without having to clone it.
export let UserInterfaceTemplate = (): UserInterface => {
    return {
        user_name: '',
        email: '',
        password: '',
        language: 'EN',
        
        profile_picture: '',

        previous_info: {
            user_name: [],
            email: [],
            password: [],
        },

        permissions: {
            groups: [ 'user' ]
        },

        security_info: {
            last_login: Date.now(),
            signup_ip: '',
            account_locked: false,
            attempts: 0,
            last_email: Date.now(),
            account_creation: Date.now(),
            email_verified: false,
            tokens: [],
            login_attempts: [],
        },

        blog_info: {
            blogs: [],
            comments: [],
        }
    };
}

export interface AuthCollection {
    ip_collection: string;
    user_collection: string;
}