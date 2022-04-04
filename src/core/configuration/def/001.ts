import { SchemaProperty } from '../../versioning/src/types';
import Defualt from '../src/defualt';

export namespace UserSchema {
    export interface ConfigurationInterface {
        version: [number, number, number],

        fastify_log: boolean,

        graphql: {
            graphiql: boolean,
            prefix: string,
        },

        mongo: {
            uri: string,
        }

        regex: {
            username: RegExp,
        }

        port: number,
    }

    export const config = {
        version: new SchemaProperty({
            acceptedTypes: [
                ['number', 'number', 'number'],
            ],
            required: false,
            defaultValue: [0, 0, 1],
            description: 'The version of the schema',
        }),

        fastify_log: new SchemaProperty({
            acceptedTypes: ['boolean'],
            required: true,
            defaultValue: false,
            description: 'Should fastify log to the console?',
        }),

        regex: {
            username: new SchemaProperty({
                acceptedTypes: ['string'],
                required: true,
                defaultValue: '/^[a-zA-Z0-9_]{3,20}$/',
                description: 'Regex that validates the username',
            }),
        },

        graphql: {
            graphiql: new SchemaProperty({
                acceptedTypes: ['boolean'],
                required: true,
                defaultValue: false,
                description: 'Should graphiql be enabled?',
            }),

            prefix: new SchemaProperty({
                acceptedTypes: ['string'],
                required: true,
                defaultValue: '/graphql',
                description: 'The prefix for the graphql endpoint',
            }),
        },

        mongo: {
            uri: new SchemaProperty({
                acceptedTypes: ['string'],
                required: true,
                defaultValue: 'mongodb://localhost:27017/test',
                description: 'The URI for the mongo database',
            }),
        },

        port: new SchemaProperty({
            acceptedTypes: ['number'],
            required: true,
            defaultValue: 3000,
            description: 'The port for the server to listen on',
        }),
    }

    export const update = (config: any): ConfigurationInterface =>  {
        return Defualt([0, 0, 1]) as ConfigurationInterface;
    }
}