import { graphql } from "../../api";
import { Mutations } from "./gql/graphQL";

export const authorization = {
    gql: () => graphql.expand(__dirname, 'gql/schema.gql', {}, Mutations)
}