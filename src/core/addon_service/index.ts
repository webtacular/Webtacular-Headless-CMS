import { FastifyInstance } from "fastify";
import { current_addons } from "./src/scan";
import { start } from "./src/load";

//--------[ Exports ]--------//
export const addons = {
    start: (app:FastifyInstance) => start(app),
    addons: current_addons,
}