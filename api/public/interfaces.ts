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

export interface UserInterface {
    _id?: ObjectId | string;

    current_info: {
        user_name: string;
        email: string;
        password: string;
        language: string;
    };

    previous_info: {
        user_name: {
            previous: string;
            timestamp: Date;
        }[];
        email: {
            previous: string;
            timestamp: Date;
        }[];
        password: {
            previous: string;
            timestamp: Date;
        }[];
    };

    security_info: {
        attempts_left: number;
        email_verified: boolean;
        
        trusted_devices?: {
            ip: string;
            creation: Date;
            expiration: Date;
            user_agent: string;
            trusted_token: string;
        }[];

        login_attempts?:{
            ip: string;
            timestamp: Date;
            user_agent: string;
            succsess: boolean;
        }[];
    };
};

//this is wraped in a function so that we can just call it
//and edit the object without having to clone it.
export let UserInterfaceTemplate = (): UserInterface => {
    return {
        current_info: {
            user_name: '',
            email: '',
            password: '',
            language: 'EN',
        },

        previous_info: {
            user_name: [],
            email: [],
            password: [],
        },

        security_info: {
            attempts_left: 0,
            email_verified: false,
            trusted_devices: [],
            login_attempts: [],
        }
    };
}