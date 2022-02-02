import { ObjectId } from "mongodb";
//God this is unorganized

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

//---------------------//
// Database interfaces //
//---------------------//


// Interface of the user object
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
        roles: Array<ObjectId>;
        owner?: boolean;
    }

    security_info: {
        signup_ip: string;
        attempts: number;
        last_login: number;
        email_verified: boolean;
        last_email: number;
        account_creation: number;
        account_locked: boolean;

        login_attempts?:{
            ip: string;
            timestamp: number;
            user_agent?: string;
            succsess: boolean;
        }[];
    };

    content: ContentInterface[];
};

export interface TokenInterface {
    _id: ObjectId;
    user_id: ObjectId | string;
    token: string;
    timestamp: number;
    expiration: number;
    admin: boolean;

    // Used for the token validation //
    // these are not stored in the DB //
    combined?: string;
    expired?: boolean;
    authorized?: boolean;
}

//------------------//
// other interfaces //
//------------------//

export interface AuthCollection {
    ip_collection: string;
    user_collection: string;
}

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
            roles: [ ],
            owner: false,
        },

        security_info: {
            last_login: Date.now() / 1000,
            signup_ip: '',
            account_locked: false,
            attempts: 0,
            last_email: Date.now() / 1000,
            account_creation: Date.now() / 1000,
            email_verified: false,
            login_attempts: [],
        },

        content: [],
    };
}

export interface RoleInterface {
    _id?: ObjectId | string;
    name: string;
    color: string;
    default?: boolean;
    permissions: string[];
    users: ObjectId[];
    precedence: number;
}

export interface ErrorInterface {
    code: number;
    local_key: string;
    where?: string;
    message: string;
}

export interface AddonInterface {
    name: string;
    description: string;
    version: string;
    author: string;
    author_email?: string;

    entry_point: string;

    update?: {
        update_url: string;
        version_url: string;
        changelog_url: string;
    } | boolean;

    types: string[];
    id: ObjectId | string;

    import: any;
}

export interface UserGetInterface { 
    [key:string]: UserInterface 
}

export interface ContentInterface {
    _id: ObjectId;
    addon_id: ObjectId;
    permissions?: {
        roles?: { [key:string]:string[] }[];
        users?: { [key:string]:string[] }[];
    };
    type: string;
    owner?: ObjectId;
    content: any;
    history: {
        content: any, 
        owner?: ObjectId, 
        date: Date, 
        eason: string
    }[];
}

export interface IPhistoryInterface {
    _id: ObjectId;
    ip: string;
    banned: boolean;
    last_accessed: number;
    created: number;
    count: number;
    settings: {
        bypass_timeout: boolean;
        bypass_acc_limit: boolean;
    };
    accounts: {
        user_id: ObjectId;  
        timestamp: number;      
    }[];
}