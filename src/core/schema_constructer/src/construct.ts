import { SchemaProperty } from '../../versioning/src/types';
import _ from 'lodash';
import createType from './createType';
import translate from './translate';

export interface SchemaConstructer {
    [key: string]: SchemaProperty | SchemaConstructer;
}

export class schemaValue { 
    typeProp: SchemaProperty;
    schema: string;
    type: string;

    constructor(
        typeProp: SchemaProperty,
        schema: string,
        type: string 
    ) {
        this.typeProp = typeProp;
        this.schema = schema;
        this.type = type;
    }
}

interface schemaObject {
    [key: string]: string | {}
}

export default (SchemaPropertyObject:SchemaConstructer): {
    [key: string]: string | {}
} => {
    // Recursively construct the schema
    const recurse = (cur:schemaObject = {}, obj:any = SchemaPropertyObject, parentNames: string[] = []): {[key: string]: schemaValue | SchemaProperty;} => {
        for(const key in obj) {
            const value = obj[key];

            if(value instanceof SchemaProperty) {
                const typeData = createType(value);

                _.merge(cur, [...parentNames, null].reduceRight((obj: {}, next : string | null):  { [x: string]: {}}  => {
                    if(next === null) return ({[key]: new schemaValue(value, typeData.schema, typeData.type)});

                    return ({[next]: obj});
                }, {})); 
            }

            if(typeof value === 'object')
                recurse(cur, value, [...parentNames, key]);
        }

        return cur as {[key: string]: schemaValue | SchemaProperty};
    }

    // Translate the OBJ to a schema and rootValues
    translate(recurse());

    return recurse();
}