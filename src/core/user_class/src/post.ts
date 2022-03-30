import { ErrorHandler, ErrorSeverity } from '../../error_handler';
import { Schema } from '../src/versioning';
import { db } from '../../..';
import GUID from '../../general_library/src/guid';

export default (User: Schema): Promise<Schema | ErrorHandler> => {
    return new Promise((resolve, reject) => {
        // Get the collection
        const collection =  db.getCollection('ghcms_users', 'users');

        // Make sure the collection is valid
        if(collection instanceof ErrorHandler) return reject(new ErrorHandler({
            severity: ErrorSeverity.NON_FATAL,
            id: new GUID('295cd853-d7fd-4e4b-bb88-f46cb576fbdc'),
            where: 'src\\core\\user_class\\src\\fetch.ts',
            function: 'getUser',
        }));
        
        // Push the user to the collection
        collection.insertOne(User as any).then((result: any) => {

            // Return the user
            resolve(User);

        }).catch(() => {
            reject(new ErrorHandler({
                severity: ErrorSeverity.FATAL,
                id: new GUID('ecd5848a-dd6f-4711-8b41-57b2f1ed86b9'),
                where: 'src\\core\\user_class\\src\\fetch.ts',
                function: 'getUser',
            }));
        });
    });
}