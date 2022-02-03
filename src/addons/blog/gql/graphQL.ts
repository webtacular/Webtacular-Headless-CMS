import { ObjectId } from "mongodb";
import { FastifyInstance } from "fastify";
import { graphql } from "../../../api";

let blog_read = async (args:any, req:FastifyInstance, context:any) => {

}

let reply_read = async (args:any, req:FastifyInstance, context:any) => {

}

export const rootFuncs = {
    blog: (args:any, req:FastifyInstance, context:any) => blog_read(args, req, context),
    reply: (args:any, req:FastifyInstance, context:any) => reply_read(args, req, context)
}