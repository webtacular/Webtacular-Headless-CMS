import { ErrorHandler, ErrorSeverity } from "../error_handler";
import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import GUID from "../general_library/src/guid";

export default class {
    #connectionString: string = '';
    #options: MongoClientOptions | undefined;
    #client: MongoClient | undefined;
    #initalized: boolean = false;

    constructor(
        connectionString: string,
        options?: MongoClientOptions
    ) {
        this.#connectionString = connectionString;
        this.#options = options;
    }

    /* 
        This function is used to initialize the connection to the database.

        @returns { Promise<void | ErrorHandler> } - A promise that resolves when the connection is established, or rejects with an error.
    */
    async init(): Promise<void | ErrorHandler> {
        return new Promise((resolve, reject) => {
            if(this.#initalized) return reject(new ErrorHandler({
                severity: ErrorSeverity.NON_FATAL,
                id: new GUID('88445619-0969-4a40-94e3-2d07bf85c9a7'),
                where: 'src\\core\\database_service\\index.ts',
                function: 'init'
            }));

            // Check if the connection string is valid ("mongodb://" or "mongodb+srv://")
            const exp: RegExp = /^(mongodb:\/\/|mongodb\+srv:\/\/)/;

            if(!exp.test(this.#connectionString)) return reject(new ErrorHandler({
                severity: ErrorSeverity.FATAL,
                id: new GUID('14e05e6d-0dc7-459e-94e0-2b6b9f5a22a7'),
                where: 'src\\core\\database_service\\index.ts',
                function: 'init',
            }));

            const client: MongoClient = new MongoClient(this.#connectionString, this.#options);

            client.connect().then((): void => {
                this.#client = client;
                resolve(undefined);

            }).catch((): void => reject(
                new ErrorHandler({
                    severity: ErrorSeverity.FATAL,
                    id: new GUID('2bd03577-62bc-46b1-b3e7-492590e9842b'),
                    where: 'src\\core\\database_service\\index.ts',
                    function: 'init'
                })
            ))
        });
        
    }

    getClient(): MongoClient {
        if(this.#client !== undefined) 
            return this.#client;

        else throw new ErrorHandler({
            severity: ErrorSeverity.FATAL,
            id: new GUID('9de6a6e2-2d07-4cb0-a1d9-2001c60a4657'),
            where: 'src\\core\\database_service\\index.ts',
            function: 'getClient'
        });
    }

    getCollection(database: string, collection: string): Collection<Document> | ErrorHandler {
        return this.getClient().db(database).collection(collection);
    }
}