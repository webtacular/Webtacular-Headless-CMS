import { SchemaProperty } from '../src/types';

export namespace UserSchema {
    export interface ConfigurationInterface {
        version: [number, number, number],

        a: boolean,
        b: string,
    }

    export const config = {
        version: new SchemaProperty({
            acceptedTypes: [
                ['number', 'number', 'number'],
            ],
            required: true,
            defaultValue: [0, 0, 0],
            description: 'The version of the schema',
        }),

        a: new SchemaProperty({
            acceptedTypes: ['boolean'],
            required: true,
            defaultValue: true,
            description: '',
        }),

        b: new SchemaProperty({
            acceptedTypes: ['string'],
            required: true,
            defaultValue: true,
            description: '',
        })
    }
}