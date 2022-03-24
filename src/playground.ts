import { gql } from './';
import { buildSchema } from 'graphql';

import formFilter from './core/graphql_handler/src/filter';

export default () => {
    gql.addSchema(buildSchema(`
        type Query {
            hello: String
            other: nested
        }

        type nested {
            name: String
        }
    `), {
        hello: (a:any, b:any, context:any) => {
            console.log(formFilter(context));

            return 'Hello World!';
        },

        nested: {
            name: 'nested',
        }
    });
}