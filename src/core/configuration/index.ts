import { LatestVersion, Schema, Versions } from "./src/versioning";
import { ErrorHandler, ErrorSeverity } from "../error_handler";

import GUID from "../general_library/src/guid";
import yaml from "js-yaml";
import fs from "fs";

import validate from "./src/validate";
import defualt from "./src/defualt";
import update from "./src/update";

import _ from "lodash";

export default class {
    absolutePath: string;
    rawInput: string;
    config: Schema;

    constructor(absolutePath: string, testingMode: boolean = false) {
        this.absolutePath = absolutePath;

        // Validate the path
        if (!fs.existsSync(absolutePath)) throw new ErrorHandler({
            severity: ErrorSeverity.FATAL,
            id: new GUID('b6aa4dec-f0da-45e9-9e62-cebefdd495ef'),
            where: 'src\\core\\configuration\\index.ts',
            function: 'constructor (path)',
        }); 

        // Read the file
        this.rawInput = fs.readFileSync(absolutePath, "utf8");

        // Parse the file
        let yamlRaw = yaml.load(this.rawInput) as any;

        // -----------[ Versioning ]----------- //
        
        let version: [number, number, number] = [
            yamlRaw?.version[0] as number ?? -1, 
            yamlRaw?.version[1] as number ?? -1,
            yamlRaw?.version[2] as number ?? -1
        ];
    
        let versionFound = false;
    
        Versions.forEach((schema, c_version) => {
            if (version[0] === c_version[0] && 
                version[1] === c_version[1] && 
                version[2] === c_version[2]) versionFound = true;
        });
    
        if(!versionFound) throw new ErrorHandler({
            severity: ErrorSeverity.FATAL,
            id: new GUID('27fa762a-81be-4021-ae17-7795950b3fbd'),
            where: 'src\\core\\configuration\\index.ts',
            function: 'constructor (version)',
        });

        if (version[0] < LatestVersion[0] ||
            (version[0] === LatestVersion[0] && version[1] < LatestVersion[1]) ||
            (version[0] === LatestVersion[0] && version[1] === LatestVersion[1] && version[2] < LatestVersion[2])){
            
            console.log(`[WARNING] The configuration file is outdated. Updateing...`);

            // Attempt to update the file
            const updated = update(yamlRaw, version, testingMode);

            console.log(`[INFO] Updated to version ${LatestVersion[0]}.${LatestVersion[1]}.${LatestVersion[2]}`);
                
            // Backup the file
            fs.copyFileSync(absolutePath, `${absolutePath}-${new Date().getTime()}-${version.join('.')}.bak`);

            // Delete the old file
            fs.unlinkSync(absolutePath);

            //Write the file
            fs.writeFileSync(absolutePath, yaml.dump(updated));

            yamlRaw = updated;
        }    

        // -----------[ Validation ]----------- //
        // Validate the file
        const validation:string[] = validate(yamlRaw, LatestVersion);

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

        // Merge the default values with the configuration
        this.config = _.merge(defualt(LatestVersion) as any, yamlRaw as Schema);
        // -----------[ Validation ]----------- //
    }

    update(newConfig: any): void {
        const combined = _.merge(this.config, newConfig);

        // Validate the file
        const validation:string[] = validate(combined, LatestVersion);

        // Check if it contains errors
        if (validation.length !== 0) { 
            console.error(validation.join("\n"));

            throw new ErrorHandler({
                severity: ErrorSeverity.FATAL,
                id: new GUID('0c88c791-f409-4d02-b161-f37522abd478'),
                where: 'src\\core\\configuration\\index.ts',
                function: 'update (validate)',
            });
        }

        // Write the file
        fs.writeFileSync(this.absolutePath, yaml.dump(combined));
    }
}