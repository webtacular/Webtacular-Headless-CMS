//----[Holy import hell, I'm sorry]----//

import { join } from 'path'
import { app } from '..';
const { graphqlHTTP } = require('express-graphql');
import { loadSchemaSync } from '@graphql-tools/load' //-------------------# Im probably going to
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader' //-# do my own file loader
import { rootFuncs } from './rootFuncs'

//------------------------------------//


// Load the schema
const schema = loadSchemaSync(join(__dirname, 'schema.gql'), { loaders: [new GraphQLFileLoader()] });


const root = {
    user: (args:any, req:any) => rootFuncs.user(args, req),
};


app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
