<h1 align="center">
    Configuration
</h1>

## Description

This module is the first module to be loaded. It is used to load the configuration file,
It is also responsible for validating the configuration file, and updating the configuration file if needed.

The configuration is stored in YML format, Each version of the configuration file is stored in the def directory,
Within this module, the configuration files use a [3 number versioning system](https://en.wikipedia.org/wiki/Software_versioning).

## data.json

This file contains the configuration file names, these files are responsible for validating the configuration file,
updating the current configuration file from the previous version, and generating a new configuration file.

```json
{
    "0.0.0": "0.0.0.ts",
    "0.0.1": "0.0.1.ts", 
    "0.0.2": "0.0.2.ts"
}
```

## x-x-x.ts

This file contains data for that specific version of the configuration file.

```typescript
// This constant is used to check if a parameter is required
// All posible values need to be listed here
export const required: Required = {
    version: [true, true, true],
    d: true,
    e: true
}

// This constant contains all parameters, including the optional ones
// This is used to validate the type of the parameter (A better way to do this would be an array that specifies the /// type of the parameter)
export const full: Interface = {
    version: [0, 0, 0],
    d: 0,
    e: ''
}

// This constant contains the default values for the parameters
// If no configuration file is found, this will be used to generate a new configuration file
// It has to have all the required parameters
export const template: Interface = {
    version: [0, 0, 2],
    d: 1,
    e: 'test'
}

// We also provide a function to update the configuration file
// It will only be able to update a configuration file,
// if the version of the configuration file is one version lower than 
// the version its being updated to

// EG Valid: 0.0.0 -> 0.0.1
// EG Invalid: 0.0.0 -> 0.0.2
// EG Valid: 0.0.0 -> 0.0.1 -> 0.0.2

export const update = (config: any): Interface => {
    // Clone the template config
    let templateClone = {...template};

    // Update the template config
    if(config?.b)
        templateClone.d = config.b;

    // Return the updated config
    return templateClone;
}
```

## Configuration Class 

This class can only be instantiated once, and is used to access and update the configuration file.

```typescript
import { Configuration } from "configuration";

const config = new Configuration();
// or
const config = new Configuration('c://config.yml');

// The current configuration
config.configuration;

// The current version of the configuration file
config.version;

// The path of the config script
config.scriptPath;

// The path of the config file
config.configPath;

// Validates a configuration object,
// Returns an array of errors if any
config.validate(config.configuration);

// Updates the configuration file
config.update({
    d: 23
});
```