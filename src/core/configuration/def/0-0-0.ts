namespace configuration {
    // 3 number versioning type
    export type versionType = [number, number, number];

    export interface Interface {
        // The version of the configuration
        version: versionType;
        a: number;
    }

    export interface Required {
        version: [boolean, boolean, boolean];
        a: boolean;
    }

    export const required: Required = {
        version: [true, true, true],
        a: true
    }

    export const full: Interface = {
        version: [0, 0, 0],
        a: 0
    }

    export const template: Interface = {
        version: [0, 0, 0],
        a: 1
    }
}

export = configuration;