
import { Versions } from "./versioning";
import { ErrorHandler, ErrorSeverity } from "../../error_handler";

import GUID from "../../general_library/src/guid";
import validate from "./validate";
import _ from "lodash";

export default (yamlRaw:any, version: [number, number, number], testingMode:boolean) => {
    // Validate the current file
    const validation:string[] = validate(yamlRaw, version);

    // Check if it contains errors
    if (validation.length !== 0){ 
        console.error(validation.join("\n"));

        throw new ErrorHandler({
            severity: ErrorSeverity.FATAL,
            id: new GUID('0c88c791-f409-4d02-b161-f37522abd478'),
            where: 'src\\core\\configuration\\index.ts',
            function: 'constructor (validate)',
        });
    }

    // Find all the versions that are newer than the current version, in order
    let versions: Array<[number, number, number]> = [];

    // Find the latest version
    Versions.forEach((schema, c_version) => {
        if (c_version[0] > version[0] ||
            (c_version[0] === version[0] && c_version[1] > version[1]) ||
            (c_version[0] === version[0] && c_version[1] === version[1] && c_version[2] > version[2])) versions.push(c_version);
    });

    // Sort the versions
    versions.sort((a, b) => {
        if (a[0] > b[0]) return 1;
        if (a[0] < b[0]) return -1;

        if (a[1] > b[1]) return 1;
        if (a[1] < b[1]) return -1;

        if (a[2] > b[2]) return 1;
        if (a[2] < b[2]) return -1;

        return 0;
    });

    versions.forEach((version, i) => {
        if (i > 1) return;
        
        const schema = Versions.get(version);

        console.log(`[INFO] Updating to version ${version[0]}.${version[1]}.${version[2]}`);

        yamlRaw = schema.update(yamlRaw);
    });

    return yamlRaw;
}