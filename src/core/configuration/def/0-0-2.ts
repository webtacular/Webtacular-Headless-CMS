namespace configuration {
    // 3 number versioning type
    export type versionType = [number, number, number];

    export interface Interface {
        // The version of the configuration
        version: versionType;
        d: number;
        e: string;
    }

    export interface Required {
        version: [boolean, boolean, boolean];
        d: boolean;
        e: boolean;
    }

    export const required: Required = {
        version: [true, true, true],
        d: true,
        e: true
    }

    export const full: Interface = {
        version: [0, 0, 0],
        d: 0,
        e: ''
    }

    export const template: Interface = {
        version: [0, 0, 2],
        d: 1,
        e: 'test'
    }

    export const update = (config: any): Interface => {
        // Clone the template config
        let templateClone = {...template};

        // Update the template config
        if(config?.b)
            templateClone.d = config.b;

        // Return the updated config
        return templateClone;
    }
}

export = configuration;