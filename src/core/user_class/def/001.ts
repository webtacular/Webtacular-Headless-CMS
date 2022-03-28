import { ObjectId } from "mongodb";
import { UserSchema as OldSchema } from "./000";

export namespace UserSchema {
    export interface User {
        _id: ObjectId;
    
        username: string;
    
        authentication: {
            lastLogin: Date;
            lastLoginIP: string;
            loginAttempts: number;
            threatLevel: number;
        };
        
        registration: {
            date: Date;
            ip: string;
        }
    
        version: [number, number, number];
    }

    export const template: User = {
        _id: new ObjectId(),

        username: "",

        authentication: {
            lastLogin: new Date(),
            lastLoginIP: "",
            loginAttempts: 0,
            threatLevel: 0,
        },

        registration: {
            date: new Date(),
            ip: "",
        },

        version: [0, 1, 0],
    }

    export const update = (config: OldSchema.User): User => {
        let clone = { ...template };

        Object.assign(clone, config);

        return clone;
    }   
}