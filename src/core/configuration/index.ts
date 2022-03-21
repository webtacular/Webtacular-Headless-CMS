import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export const validate = (configuration:any, required:any, template:any): string[] => {
    // Check if the configuration is an object
    if (typeof configuration !== 'object')
        return ['configuration is not an object'];

    interface valArray {
        path: string,
        value: any,
        type: string
    }

    let configValues: valArray[] = [],
        requiredValues: valArray[] = [],
        templateValues: valArray[] = [];

    // Recursively go trough each nested item in the config
    const recurse = (config:any, arr:Array<{ value: any, type: string, path: string }>, path?:string):void => {
        Object.keys(config)?.forEach((key:string) => {
            const value = config[key],
                newPath = path ? path + '.' + key : key;

            if(typeof value !== 'object') arr.push({
                path: newPath,
                value,
                type: typeof value,
            });

            if(typeof config[key] === 'object' && config[key] !== null)
                recurse(value, arr, newPath);
        });
    }   
    
    recurse(configuration, configValues);
    recurse(required, requiredValues);
    recurse(template, templateValues);

    let log: string[] = [];

    // Check if the all configValues are present in TemplateValues
    for (let i = 0; i < requiredValues.length; i++) {
        // Find the required value in the templateValues
        const templateValue = templateValues.find((value) => value.path === requiredValues[i].path);

        // Try and find the configValue in the configValues
        const configValue = configValues.find((value) => value.path === requiredValues[i].path);

        // If no configValue is found and the requiredValue is not optional, continue
        if (!configValue && requiredValues[i].value === false) continue;

        // If no configValue is found and the requiredValue is true, set valid to false
        if (!configValue && requiredValues[i].value === true) {
            log.push(`Missing required value: ${requiredValues[i].path}, type: ${templateValue?.type}`);
            continue;
        }

        // Compare the type of the configValue to the type of the templateValue
        if (configValue?.type !== templateValue?.type) {
            log.push(`Invalid type for value: ${requiredValues[i].path}, original type: ${configValue?.type}, required type: ${templateValue?.type}`);
            continue;
        }
    }

    return log;
}

export const init = (): void => {
    // Get the current directory
    const currentDir = process.cwd(),
        dataPath = path.join(currentDir, './src/core/configuration/def/data.json');

    // Check if the data.json file exists
    if (!fs.existsSync(dataPath))
        throw new Error('data.json does not exist');

    // Read the data.json file
    const data = fs.readFileSync(dataPath, 'utf8');
    
    // Parse the data
    const parsedData = JSON.parse(data);

    // Version array
    let versions: Array<{
        version: number[],
        path: string
    }> = [];

    // Go through each key
    Object.keys(parsedData).forEach((key) => {
        // Get the version of the curent key
        let version: number[] = key.split('.').map(x => parseInt(x));

        // push the version to the array
        versions.push({
            version,
            path: path.join(currentDir, './src/core/configuration/def/' + parsedData[key])
        });
    });

    // Config path
    const configPath = path.join(currentDir, 'config.yml');

    // Check if a curent configuration exists
    if (!fs.existsSync(configPath)) {
        // Find the latest version of the configuration
        const latestVersion = versions.reduce((a, b) => a.version[0] > b.version[0] ? a : b);

        // Check if the defualt configuration exists
        if (!fs.existsSync(latestVersion.path))
            throw new Error('The defualt configuration does not exist');

        // Read the defualt configuration
        const defualtConfigData = require(latestVersion.path);

        // Write the configuration
        fs.writeFileSync(configPath, yaml.dump(defualtConfigData.template));

        return;
    }

    // Read the config.yml file
    const config = fs.readFileSync(configPath, 'utf8');
    
    // Parse the config
    let parsedConfig = yaml.load(config) as any;

    // Get the version of the curent configuration
    const version: number[] = parsedConfig.version;

    // Find that version in the data.json
    const versionData = versions.find(x => x.version[0] === version[0] && x.version[1] === version[1] && x.version[2] === version[2]);

    // Make sure the version was found
    if(!versionData)
        throw new Error('The configuration version does not exist');

    // Validate the configuration
    const current = require(versionData.path);

    const log = validate(parsedConfig, current.required, current.full);

    // Check if the configuration is valid
    if (log.length > 0) {
        log.forEach((error) => console.log(error));
        throw new Error('The configuration is invalid');
    }

    // Check if there is a newer version of the configuration
    const latestVersion = versions.reduce((a, b) => a.version[0] > b.version[0] ? a : b);

    // Check if we need to update the configuration
    if(latestVersion.version[0] > version[0] || latestVersion.version[1] > version[1] || latestVersion.version[2] > version[2]) {
        // Backup the configuration
        fs.copyFileSync(configPath, path.join(currentDir, `config.backup.${Date.now()}.yml`));

        // Find all the versions that are newer than the current version in order
        const newerVersions = versions.filter(x => 
            x.version[0] > version[0] || 
            x.version[1] > version[1] || 
            x.version[2] > version[2]
        );

        // This variable will hold the configuration that will be written to the config.yml file
        let currentConfig = parsedConfig;

        // One by one update the configuration
        newerVersions.forEach((version) => {
            // Read the configuration
            const config = require(version.path);
            
            console.log(`Updating configuration to version: ${version.version.join('.')}`);

            // Update the configuration
            currentConfig = config.update(currentConfig);

            console.log(`Updated configuration to version: ${version.version.join('.')}`);
        });

        // Write the configuration
        fs.writeFileSync(configPath, yaml.dump(currentConfig));

        parsedConfig = currentConfig;
    }

    // return the configuration
    return parsedConfig;
}