import fastify from 'fastify';

export class fastifyInstance {
    public fastify: any;

    constructor() {
        this.fastify = fastify();
    }
    
    public async start() {
        await this.fastify.listen(0);

        return this.fastify;
    }
    
    public async stop() {
        await this.fastify.close();
        this.fastify = fastify();
    }
}
