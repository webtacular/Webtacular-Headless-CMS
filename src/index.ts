import Fastify, { FastifyInstance } from "fastify";
import hotQL from "fastify-hotql";

import playground from "./playground";
import loadConfig from "./core/configuration";
import MongoService from "./core/database_service";
import path from "path";

// Load configuration
const config: loadConfig = new loadConfig(path.resolve(__dirname, "../config.yml"));

console.log(config.config);
// // Initialize the server
// const app: FastifyInstance = Fastify({
//     logger: config.configuration.fastify_log,
// });

// // Instantiate the graphql api
// const gql = new hotQL(app, {
//     prefix: config.configuration.graphql.prefix,
//     graphiql: config.configuration.graphql.graphiql,
//     graphiql_prefix: config.configuration.graphql.prefix + '/explore',
// });

// // Initialize the database service
// const db: MongoService = new MongoService(config.configuration.mongo.uri);

// // Start the server
// (async(): Promise<void> => {
//     // Wait for the database to be ready
//     await db.init();

//     playground();

//     app.listen(config.configuration.port, (error: any): void => {
//         if (error) throw error;
//         else console.log(`Server started: http://127.0.0.1:${config.configuration.port}`);
//     });
// })();

// export {
//     app,
//     gql,
//     config,
//     db,
// };