import { Versions } from './versioning';
import { SchemaProperty } from '../../versioning/src/types';

import { ErrorHandler, ErrorSeverity } from '../../error_handler';
import GUID from '../../general_library/src/guid';
import _ from 'lodash';

export default (version: [number, number, number]): any => {
    // Find the version
    let versionSchema: any = null;

    // Try and locate the version
    for (let [key, value] of Versions.entries()) {
        if (key[0] === version[0] && key[1] === version[1] && key[2] === version[2]) {
            versionSchema = value;
            break;
        }
    }

    // If the version is not found, throw an error
    if (versionSchema === null) throw new ErrorHandler({
        severity: ErrorSeverity.FATAL,
        id: new GUID('27fa762a-81be-4021-ae17-7795950b3fbd'),
        where: 'src\\core\\configuration\\src\\defualt.ts',
        function: 'default',
    });

    // Recursively go trough each nested item in the versionSchema.schema
    // and create a object with the same structure as the schema and all
    // the default values

    const returnObject: any = {};

    const recurse = (schema:any, parentName:string[] = []): void => {
        for (let [key, value] of Object.entries(schema)) {

            if (value instanceof SchemaProperty) 
                _.merge(returnObject, [...parentName, null].reduceRight((obj, next): { [x: string]: {} } => {
                    if(next === null) return ({ [key]: (value as SchemaProperty).defaultValue });
                    return { [next]: obj };
                }, {}));
            
            if (value instanceof Object) 
                recurse(value, [...parentName, key]);
        }

        return returnObject;
    }

    return recurse(versionSchema.config);
}