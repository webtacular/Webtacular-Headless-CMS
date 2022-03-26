import { FastifyReply, FastifyRequest } from "fastify";
import { fastifyInstance } from "./helper";

import createFilter from "../src/filter";
import { buildSchema } from "graphql";
import hotQL from "fastify-hotql";

const cfi = new fastifyInstance();

beforeEach(async () => {
    await cfi.stop();
});

test('Server (GET)', () => {
    cfi.fastify.get('/', async (req: FastifyRequest, res: FastifyReply) => {
        res.send('Hello World');
    });

    return cfi.start().then(() => {

        cfi.fastify.inject({
            method: 'GET',
            url: '/'
        }, (err: any, res: any) => {
            expect(res.statusCode).toBe(200);
            expect(res.payload).toBe('Hello World');
        });

    }).catch((err: any) => {
        throw err;
    });
});

test('Server (POST)', () => {
    cfi.fastify.post('/', async (req: FastifyRequest, res: FastifyReply) => {
        res.send('Hello World');
    });
    
    return cfi.start().then(() => {
        
        cfi.fastify.inject({
            method: 'POST',
            url: '/'
        }, (err: any, res: any) => {
            expect(res.statusCode).toBe(200);
            expect(res.payload).toBe('Hello World');
        });

    }).catch((err: any) => {
        throw err;
    });
});

test('Filter: Single paramater query', async() => {
    // Create a promise that resolves when a request is received
    let value: Promise<any> = new Promise(() => {});

    const gql = new hotQL(cfi.fastify, {
        prefix: '/graphql',
    });

    const hello = (a:any, b:any, context:any) => {
        // Resolve the promise
        value = Promise.resolve(createFilter(context));
    };

    gql.addSchema(buildSchema(`
        type Query {
            hello: String
        }`), { hello }
    );

    await cfi.start();

    await cfi.fastify.inject({
        method: 'POST',
        url: '/graphql',
        payload: {
            query: `
                query {
                    hello
                }
            `
        }
    });

    expect(value).resolves.toEqual({
        hello: 1
    });
});

test('Filter: Nested paramater query', async() => {
    // Create a promise that resolves when a request is received
    let value: Promise<any> = new Promise(() => {});

    const gql = new hotQL(cfi.fastify, {
        prefix: '/graphql',
    });

    const nested = (a:any, b:any, context:any) => {
        // Resolve the promise
        value = Promise.resolve(createFilter(context));
    };

    gql.addSchema(buildSchema(`
        type Query {
            nested: nested
        }

        type nested {
            name: String
        }`), { nested }
    );

    await cfi.start();

    await cfi.fastify.inject({
        method: 'POST',
        url: '/graphql',
        payload: {
            query: `
                query {
                    nested {
                        name
                    }
                }
            `
        }
    });

    expect(value).resolves.toEqual({
        nested: {
            name: 1
        }
    });
});

test('Filter: Nested + single query', async() => {
    // Create a promise that resolves when a request is received
    let value: Promise<any> = new Promise(() => {});

    const gql = new hotQL(cfi.fastify, {
        prefix: '/graphql',
    });

    const hello = (a:any, b:any, context:any) => {
        // Resolve the promise
        value = Promise.resolve(createFilter(context));
    };

    gql.addSchema(buildSchema(`
        type Query {
            hello: String
            other: nested
        }

        type nested {
            name: String
        }`), { hello, nested: { name: 'nested' } }
    );

    await cfi.start();

    await cfi.fastify.inject({
        method: 'POST',
        url: '/graphql',
        payload: {
            query: `
                query {
                    hello
                    other {
                        name
                    }
                }
            `
        }
    });

    expect(value).resolves.toEqual({
        hello: 1,
        other: {
            name: 1
        }
    });
});

test('Filter: Multiple paramaters query', async() => {
    // Create a promise that resolves when a request is received
    let value: Promise<any> = new Promise(() => {});

    const gql = new hotQL(cfi.fastify, {
        prefix: '/graphql',
    });

    const hello = (a:any, b:any, context:any) => {
        // Resolve the promise
        value = Promise.resolve(createFilter(context));
    };

    gql.addSchema(buildSchema(`
        type Query {
            hello: String
            other: String
        }
        `), { hello }
    );

    await cfi.start();

    await cfi.fastify.inject({
        method: 'POST',
        url: '/graphql',
        payload: {
            query: `
                query {
                    hello
                    other
                }
            `
        }
    });

    expect(value).resolves.toEqual({
        hello: 1,
        other: 1
    });
});

test('Filter: Deeply nested + Single', async() => {
    // Create a promise that resolves when a request is received
    let value: Promise<any> = new Promise(() => {});

    const gql = new hotQL(cfi.fastify, {
        prefix: '/graphql',
    });

    const other = (a:any, b:any, context:any) => {
        // Resolve the promise
        value = Promise.resolve(createFilter(context));
    };

    gql.addSchema(buildSchema(`
        type Query {
            other: nested
        }

        type nested {
            other: nested2
        }

        type nested2 {
            name: String
        }
        
        `), { other }
    );

    await cfi.start();

    await cfi.fastify.inject({
        method: 'POST',
        url: '/graphql',
        payload: {
            query: `
                query {
                    other {
                        other {
                            name
                        }
                    }
                }
            `
        }
    });

    expect(value).resolves.toStrictEqual({ other: { other: { name: 1 } } });
});

test('Filter: Deeply nested + Single', async() => {
    // Create a promise that resolves when a request is received
    let value: Promise<any> = new Promise(() => {});

    const gql = new hotQL(cfi.fastify, {
        prefix: '/graphql',
    });

    const hello = (a:any, b:any, context:any) => {
        // Resolve the promise
        value = Promise.resolve(createFilter(context));
    };

    gql.addSchema(buildSchema(`
        type Query {
            hello: String
            other: nested
        }

        type nested {
            name: String
            other: nested2
        }

        type nested2 {
            name: String
        }
        
        `), { hello }
    );

    await cfi.start();

    await cfi.fastify.inject({
        method: 'POST',
        url: '/graphql',
        payload: {
            query: `
                query {
                    hello
                    other {
                        name
                        other {
                            name
                        }
                    }
                }
            `
        }
    });

    expect(value).resolves.toStrictEqual({ hello: 1, other: { name: 1, other: { name: 1 } } });
});