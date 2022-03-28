import { initial } from "lodash";

namespace configuration {
    type authInterface = {
        use?: boolean;
        require?: boolean;
    }

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
        mongo: {
            uri: string;
        },
        authentication?: {

            totp?: authInterface;

            email?: authInterface & {
                initial: boolean;
                list?: ['blacklist' | 'whitelist', string[]];
            }

            username?: authInterface & {
                initial: boolean;
                regex: RegExp;
            }

            password?: authInterface & {
                regex: RegExp;
            }

            phone?: authInterface & {
                initial: boolean;
                list?: ['blacklist' | 'whitelist', {type: 'number' | 'country', value: string}[]];
            }

            oauth?: Array<{
                provider: string;
                use: boolean;
            }>;
        }
    }

    export interface Required {
        version: [boolean, boolean, boolean];
        fastify_log: boolean;
        port: boolean;
        graphql: {
            graphiql: boolean;
            prefix: boolean;
        };
        mongo: {
            uri: boolean;
        };
        authentication: {
            totp: {
                use: boolean;
                require: boolean;
            };

            email: {
                use: boolean;
                require: boolean;
                initial: boolean;
                list: [boolean, boolean[]];
            };

            username: {
                use: boolean;
                require: boolean;
                initial: boolean;
                regex: boolean;
            };

            password: {
                use: boolean;
                require: boolean;
                regex: boolean;
            };

            phone: {
                use: boolean;
                require: boolean;
                initial: boolean;
                list: [boolean, {type: boolean, value: boolean}[]];
            };

            oauth: {
                use: boolean;
                provider: boolean;
            }
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
        mongo: {
            uri: true,
        },
        authentication: {
            
            totp: {
                use: false,
                require: false,
            },

            email: {
                use: false,
                require: false,
                initial: false,
                list: [false, [false]],
            },

            username: {
                use: false,
                require: false,
                initial: false,
                regex: false,
            },

            password: {
                use: false,
                require: false,
                regex: false,
            },

            phone: {
                use: false,
                require: false,
                initial: false,
                list: [false, [{type: false, value: false}]],
            },

            oauth: {
                use: false,
                provider: true,
            }
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
        mongo: {
            uri: "mongodb://",
        },
        authentication: {
            email: {
                use: true,
                require: true,
                initial: true,
                list: ['blacklist', []],
            },

            username: {
                use: true,
                require: true,
                initial: true,
                regex: /^[a-zA-Z0-9_]{3,20}$/,
            },

            password: {
                use: true,
                require: true,
                regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
            },

            phone: {
                use: true,
                require: true,
                initial: true,
                list: ['blacklist', [{type: 'country', value: '+1'}]],
            },

            oauth: [
                {
                    provider: 'google',
                    use: true,
                },
            ]
        }
    }

    export const template: Interface = {
        version: [0, 1, 0],
        port: 3000,
        mongo: {
            uri: "mongodb://",
        }
    }

    export const update = (config: any): Interface => {
        // Return the updated config
        return template;
    }
}

export = configuration;