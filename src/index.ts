import loadConfig from "./core/configuration";
import Fastify from "fastify";
import hotQL from "fastify-hotql";

import playground from "./playground";

// Load configuration
const config = new loadConfig();

// Initialize the server
const app = Fastify({
    logger: config.configuration.fastify_log,
});

// Instantiate the graphql api
const gql = new hotQL(app, {
    prefix: config.configuration.graphql.prefix,
    graphiql: config.configuration.graphql.graphiql,
    graphiql_prefix: config.configuration.graphql.prefix + '/explore',
});

// Start the server
(async() => {
    playground()

    app.listen(config.configuration.port, (error: any) => {
        if (error) throw error;
        else console.log(`Server started: http://127.0.0.1:${config.configuration.port}`);
    });
})();

export {
    app,
    gql,
    config,
};