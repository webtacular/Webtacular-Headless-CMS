import { ErrorHandler } from '../../error_handler';
import validate from './validate';
import _ from 'lodash';

export default (yamlRaw:any, version: [number, number, number], Versions: Map<[number, number, number], any>, testingMode:boolean) => {
    // Validate the current file
    const validation: true | ErrorHandler = validate(yamlRaw, version, Versions);

    // Check if it contains errors
    if (validation instanceof ErrorHandler) throw validation;

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
        const schema = Versions.get(version);

        yamlRaw = schema.update(yamlRaw);
    });

    return yamlRaw;
}