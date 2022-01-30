import { FastifyInstance } from "fastify";
import { expandGraphQL, lockGraphQL } from "./src/graphql";
import form from "./src/formFilter";

export interface GraphQLFunctions {
    expand: (path:string, file_name:string, resolver?:any) => void;
    lock: (app:FastifyInstance, graphiql?:boolean, path?:string) => Promise<void>;
    filter: (context:any) => any;
}

export let graphql:GraphQLFunctions = {
    expand: (path:string, file_name:string, resolver?:any) => expandGraphQL(path, file_name, resolver),
    lock: (app:FastifyInstance, graphiql?:boolean, path?:string) => lockGraphQL(app, graphiql, path),
    filter: (context:any) => form(context)
};