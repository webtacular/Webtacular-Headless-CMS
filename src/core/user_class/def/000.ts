import { ObjectId } from 'mongodb';
import { SchemaProperty } from '../../versioning/src/types';
import { UserSchema as OldSchema } from './000';
import defualt from '../../versioning/src/defualt';

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

    export const config = {
        _id: new ObjectId(),

        username: '',

        authentication: {
            lastLogin: new SchemaProperty({
                acceptedTypes: ['date'],
                required: true,
                defaultValue: new Date(),
                description: 'This is the last time the user logged in',
                private: false,
            }),

            loginVisibility: new SchemaProperty({
                acceptedTypes: ['boolean'],
                required: true,
                defaultValue: true,
                description: 'The user can change this value, if true, other users can see the user\'s last login',
                private: false,
            }),
            
            lastLoginIP: new SchemaProperty({
                acceptedTypes: ['string'],
                required: true,
                defaultValue: '',
                description: 'The IP address of the last login',
                private: true,
            }),

            loginAttempts: new SchemaProperty({
                acceptedTypes: ['number'],
                required: true,
                defaultValue: 0,
                description: 'Amount of failed login attempts',
                accessGroup: ['administrator', 'self'],
            }),

            threatLevel: new SchemaProperty({
                acceptedTypes: ['number'],
                required: true,
                defaultValue: 0,
                description: 'The threat level of the user',
                accessGroup: ['administrator'],
            }),
        },

        registration: {
            date: new SchemaProperty({
                acceptedTypes: ['date'],
                required: true,
                defaultValue: new Date(),
                description: 'This is the date of registration',
                private: false
            }),

            ip: new SchemaProperty({
                acceptedTypes: ['string'],
                required: true,
                defaultValue: '',
                description: 'This is the IP of registration',
                private: true
            })
        },

        version: new SchemaProperty({
            acceptedTypes: [
                ['number', 'number', 'number'],
            ],
            required: true,
            defaultValue: [0, 0, 0],
            description: 'The version of the schema',
        }),
    }
}