<h1 align="center">
    Configuration, Attempt 2
</h1>

## Description

This module is the first module to be loaded. It is used to load the configuration file,
It is also responsible for validating the configuration file, and updating the configuration file if needed.

The configuration is stored in YML format, Each version of the configuration file is stored in the def directory,
Within this module, the configuration files use a [3 number versioning system](https://en.wikipedia.org/wiki/Software_versioning)

## xxx.ts

```typescript
import { SchemaProperty } from "../src/types";
import Defualt from "../src/defualt";

export namespace UserSchema {
    export interface ConfigurationInterface {
        version: [number, number, number],
        imAnumber: number,
        imAString: string,
        imAnArray: string[],

        imNested: {
            imNestedNumber: number,
        },
    }

    export const config = {
        version: new SchemaProperty({
            acceptedTypes: [
                ['number', 'number', 'number'],
            ],
            required: false,
            defaultValue: [0, 0, 1],
            description: "The version of the schema",
        }),

        imAnumber: new SchemaProperty({
            acceptedTypes: [
                ['number'],
            ],
            required: true,
            defaultValue: 0,
            description: "A number",
        }),

        imAString: new SchemaProperty({
            acceptedTypes: [
                ['string'],
            ],
            required: true,
            defaultValue: "",
            description: "A string",
        }),

        imAnArray: new SchemaProperty({
            acceptedTypes: [
                ['string'],
            ],
            required: true,
            defaultValue: [],
            description: "An array of strings",
        }),
        
        imNested:{ 
            imNestedNumber: new SchemaProperty({
                acceptedTypes: [
                    ['number'],
                ],
                required: true,
                defaultValue: 0,
                description: "A number",
            }),
        }
    }

    export const update = (config: any): ConfigurationInterface =>  {
        return Defualt([0, 0, 1]) as ConfigurationInterface;
    }
}
```

## src/versioning.ts

```typescript
// Import your new schema
import { UserSchema as Schema000 } from "../def/000";
import { UserSchema as Schema001 } from "../def/001";

//                              UPDATE ME TOO   //
//                              VVV ------ VVV  //
export interface Schema extends Schema001.ConfigurationInterface {}

// MAP of the schema versions
export const Versions = new Map<[number, number, number], any>([]);

// And add them to the map
Versions.set([0, 0, 0], Schema000);
Versions.set([0, 0, 1], Schema001);

// ----------[ Everything below this line is not to be modified ]----------//

export let LatestVersion: [number, number, number] = [0, 0, 0];

// Find the latest version
for(let version of Versions.keys()) {
    if(version[0] >= LatestVersion[0] && 
        version[1] >= LatestVersion[1] && 
        version[2] >= LatestVersion[2]) 
        LatestVersion = version;
}
```