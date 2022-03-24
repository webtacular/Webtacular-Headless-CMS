namespace configuration {
    // 3 number versioning type
    export type versionType = [number, number, number];

    export interface Interface {
        // The version of the configuration
        version: versionType;
        fastify_log?: boolean;
        port: number;
        graphql?: {
            graphiql?: boolean;
            prefix?: string;
        };
    }

    export interface Required {
        version: [boolean, boolean, boolean];
        fastify_log: boolean;
        port: boolean;
        graphql: {
            graphiql: boolean;
            prefix: boolean;
        };
    }

    export const required: Required = {
        version: [true, true, true],
        fastify_log: false,
        port: true,
        graphql: {
            graphiql: false,
            prefix: false,
        },
    }

    export const full: Interface = {
        version: [0, 1, 0],
        fastify_log: false,
        port: 3000,
        graphql: {
            graphiql: false,
            prefix: "/graphql",
        },
    }

    export const template: Interface = {
        version: [0, 1, 0],
        port: 3000,
    }

    export const update = (config: any): Interface => {
        // Return the updated config
        return template;
    }
}

export = configuration;