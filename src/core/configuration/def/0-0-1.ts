import { Interface } from "readline";

namespace configuration {
    // 3 number versioning type
    export type versionType = [number, number, number];

    export interface Interface {
        // The version of the configuration
        version: versionType;
        b: number;
        c?: number;
    }

    export interface Required {
        version: [boolean, boolean, boolean];
        b: boolean;
        c: boolean;
    }

    export const required: Required = {
        version: [true, true, true],
        b: true,
        c: false
    }

    export const full: Interface = {
        version: [0, 0, 0],
        b: 0,
        c: 0
    }

    export const template: Interface = {
        version: [0, 0, 1],
        b: 1
    }

    export const update = (config: any): Interface => {
        // Clone the template config
        let templateClone = {...template};

        // Update the template config
        if(config?.a)
            templateClone.b = config.a;

        // Return the updated config
        return templateClone;
    }
}

export = configuration;