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
            other: nested2
        }

        type nested2 {
            name: String
        }
    `), {
        hello: (a:any, b:any, context:any) => {
            console.log(formFilter(context));

            return 'Hello World!';
        }
    });
}