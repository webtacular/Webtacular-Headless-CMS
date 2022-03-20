<h1 align="center">
    Configuration
</h1>

## Description

This module is the first module to be loaded. It is used to load the configuration file,
It is also responsible for validating the configuration file, and updating the configuration file if needed.

The configuration is stored in YML format, Each version of the configuration file is stored in the def directory,
Within this module, the configuration files use a [3 number versioning system](https://en.wikipedia.org/wiki/Software_versioning).

## data.json

This file contains information on how to update the configuration file.

```json
{
    "0.0.0": { // Version 0.0.0

        // This file is responsible for loading the default 
        // configuration file for version 0.0.0 of the configuration file.
        "defualt": "0.0.0.ts",

        // This file is responsible for converting the configuration file
        // to the next version.
        "update": "0.0.1.ts"
    },
    
    "0.0.1": { // Version 0.0.1
        "defualt": "0.0.1.ts",
    }
}
```