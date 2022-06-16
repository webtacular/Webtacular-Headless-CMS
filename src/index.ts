import Fastify, { FastifyInstance } from 'fastify';
import hotQL from 'fastify-hotql';

import playground from './playground';
import loadConfig from './core/configuration';
import MongoService from './core/database_service';
import path from 'path';
import { buildSchema } from 'graphql';

// Load configuration
const config: loadConfig = new loadConfig(path.resolve(__dirname, '../config.yml'));

// Initialize the server
const app: FastifyInstance = Fastify({
    logger: config.config.fastify_log,
});

// Instantiate the graphql api
const gql = new hotQL(app, {
    prefix: config.config.graphql.prefix,
    graphiql: config.config.graphql.graphiql,
    graphiql_prefix: config.config.graphql.prefix + '/explore',
});

// Initialize the database service
const db: MongoService = new MongoService(config.config.mongo.uri);

// Start the server
(async(): Promise<void> => {
    // Wait for the database to be ready
    await db.init();
    
    // Start creating the user schema from the configuration


    await playground();

    app.listen(config.config.port, (error: any): void => {
        if (error) throw error;
        else console.log(`Server started: http://127.0.0.1:${config.config.port}`);
    });
})();

export {
    app,
    gql,
    config,
    db,
};
