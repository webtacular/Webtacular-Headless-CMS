import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const validate = (configuration:any, required:any, template:any): string[] => {
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
        if (!configValue && requiredValues[i].value === true) 
            log.push(`Missing required value: ${requiredValues[i].path}, type: ${templateValue?.type}`);

        // Compare the type of the configValue to the type of the templateValue
        if (configValue?.type !== templateValue?.type) 
            log.push(`Type mismatch for value: ${requiredValues[i].path}, current type: ${configValue?.type}, required type: ${templateValue?.type}`);
    }

    // Check if configValues contains any values that are not in the templateValues
    for (let i = 0; i < configValues.length; i++) {
        // Find the configValue in the templateValues
        const templateValue = templateValues.find((value) => value.path === configValues[i].path);
        
        // If nothing is found, log the error
        if(!templateValue)
            log.push(`Invalid value: ${configValues[i].path}, type: ${configValues[i].type}`);
    }

    return log;
}

const init = (userPath?:string): any[] => {
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
    const configPath = userPath ? userPath : path.join(currentDir, 'config.yml');

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

        return [
            defualtConfigData,
            latestVersion,
            (config: any) => validate(config, defualtConfigData.required, defualtConfigData.full),
            configPath
        ];
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

    const logs = validate(parsedConfig, current.required, current.full);

    // Check if the configuration is valid
    if (logs.length > 0) 
        throw new Error('The configuration is invalid because: ' + logs.join(', '));

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

    // Get the latest valid data
    const latest = require(latestVersion.path);

    // return the configuration
    return [
        parsedConfig,
        latestVersion,
        (config: any) => validate(config, latest.required, latest.full),
        configPath
    ];
}

export default class Configuration {
    // Make sure that the class can only be instantiated once
    private static _instance: Configuration;

    configuration: any;
    version: [number, number, number] = [0, 0, 0];
    scriptPath: string = '';
    configPath: string = '';
    validate: (config: any) => any[] = (config) => [];

    constructor(path?:string) {
        // Make sure that the class can only be instantiated once
        if (Configuration._instance)
            throw new Error('Configuration can only be instantiated once');

        // Set the instance
        Configuration._instance = this;

        // Initialize the configuration
        const data = init(path);

        this.configuration = data[0];

        this.version = data[1].version;

        this.scriptPath = data[1].path;

        this.configPath = data[3];

        this.validate = data[2];
    }

    update(config: any) {
        // Clone the current configuration
        const current = { ...this.configuration };

        // Merge the new configuration with the current configuration
        const updated = Object.assign(current, config);

        // Verify that the new configuration is valid
        const logs = this.validate(updated);

        // Throw an error if the configuration is invalid
        if (logs.length > 0)
            return new Error('The configuration is invalid because: ' + logs.join(', '));

        // Set the new configuration
        this.configuration = updated;

        // Write the configuration
        fs.writeFileSync(this.configPath, yaml.dump(updated));

        // Return the new configuration
        return updated;
    }
}