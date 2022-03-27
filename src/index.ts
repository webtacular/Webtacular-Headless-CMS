import loadConfig from "./core/configuration";
import Fastify, { FastifyInstance } from "fastify";
import hotQL from "fastify-hotql";

import playground from "./playground";
import Configuration from "./core/configuration";

// Load configuration
const config: Configuration = new loadConfig();

// Initialize the server
const app: FastifyInstance = Fastify({
    logger: config.configuration.fastify_log,
});

// Instantiate the graphql api
const gql = new hotQL(app, {
    prefix: config.configuration.graphql.prefix,
    graphiql: config.configuration.graphql.graphiql,
    graphiql_prefix: config.configuration.graphql.prefix + '/explore',
});

// Start the server
(async(): Promise<void> => {
    playground()

    app.listen(config.configuration.port, (error: any): void => {
        if (error) throw error;
        else console.log(`Server started: http://127.0.0.1:${config.configuration.port}`);
    });
})();

export {
    app,
    gql,
    config,
};