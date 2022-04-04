import { Versions } from './versioning';
import { SchemaProperty } from '../../versioning/src/types';

import { ErrorHandler, ErrorSeverity } from '../../error_handler';
import GUID from '../../general_library/src/guid';

export default (configuration: any, version: [number, number, number]): string[] => {
    // Find the version
    let versionSchema: any;

    // Try and locate the version
    for (let [key, value] of Versions.entries()) {
        if (key[0] === version[0] && key[1] === version[1] && key[2] === version[2]) {
            versionSchema = value;
            break;
        }
    }

    // If the version is not found, throw an error
    if (!versionSchema) throw new ErrorHandler({
        severity: ErrorSeverity.FATAL,
        id: new GUID('27fa762a-81be-4021-ae17-7795950b3fbd'),
        where: 'src\\core\\configuration\\src\\validate.ts',
        function: 'default',
    });

    let errorArray: string[] = [];
    
    // console.log(versionSchema.config.version.validate([1, 2, 1]));
    // Recursively go trough each nested item in the versionSchema.schema
    // and validate the configuration against it using the validate function
    const recurse = (schema: any, config: any): string[] => {
        for (let [key, value] of Object.entries(schema)) {
            if (value instanceof SchemaProperty) if (!value.validate(config[key])) errorArray.push(`[${key}] is not valid, expected [${value.acceptedTypes.join(' OR ')}]`);
            else if (config[key] instanceof Object) if (!recurse(value, config[key])) errorArray.push(`[${key}] is not valid, expected [${value.acceptedTypes.join(' OR ')}]`);
        }

        return errorArray;
    }

    return recurse(versionSchema.config, configuration);
}