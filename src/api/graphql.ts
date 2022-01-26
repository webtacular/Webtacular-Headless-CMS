//----[Imports]----//

import { FastifyInstance } from 'fastify';
import { join } from 'path'

const mercurius = require('mercurius')

//------------------------------------//

let schemas:any[] = [],
    root_resolver:any = {},
    root_loader:any = {};

/**
 * WARNING. When you want to add a new root key, you MUST use the following format:
 * expand type Query {
 * }
 * 
 * this defines custom schema + resolvers for the graphql api
 * 
 * @param path usaly __dirname, but can be anything
 * @param file_name usually 'schema.gql'
 * @param root_resolver the root resolver for the schema
 */
export function expandGQL(path:string, file_name:string, resolver?:any):void {
    // Load the schema
    schemas.push(require('fs').readFileSync(join(path, file_name), 'utf8')); //TODO: Query can only be loaded once, so we need a way to combine it

    // Load the resolvers and loaders

    if(resolver)
        Object.assign(root_resolver, resolver);
}

/**
 * This function is used to setup the graphql api,
 * after its called, no more changes can be made to the api,
 * to expand the schema you have to restart the server.
 * 
 * @param app the fastify instance
 * @param graphiql boolean - if true, the graphiql interface will be enabled
 * @param path the path to the graphql api
 */
export function lockGraphQL(app:FastifyInstance, graphiql:boolean = false, path:string = '/graphql') {
    let combined = schemas.join('\n');

    app.register(mercurius, {
        schema: combined,
        resolvers: root_resolver,
        loaders: root_loader,
        graphiql,
        path
    });
}
