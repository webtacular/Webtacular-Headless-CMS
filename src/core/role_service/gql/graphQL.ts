import { precedence, role as role_service } from "../";
import { ObjectId } from "mongodb";
import { FastifyInstance } from "fastify";
import { graphql } from "../../../api";
import { RoleInterface } from "../../interfaces";

let role = async (args:any, req:FastifyInstance, context:any) => {
    // Test the Name
    if(ObjectId.isValid(args?.id) !== true)
        return;

    // Return any found data
    return ((await role_service.get(new ObjectId(args.id), graphql.filter(context).role)) as RoleInterface[])[0];
}

export const rootFuncs = {
    role: role,
    roles: async() => { 
        let roles:any = await precedence.get().catch(() => { return [] }),
            formated:{ id:string, precedence:number }[] = [];

        (roles as ObjectId[]).forEach((role, i) => formated = [...formated, { id: role.toString(), precedence: i }]);
        
        return formated;
    }
}