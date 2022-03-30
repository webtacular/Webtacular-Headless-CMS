import { db } from '../../..';
import { ErrorHandler, ErrorSeverity } from '../../error_handler';
import GUID from '../../general_library/src/guid';
import { FilterInterface } from '../../graphql_handler/src/filter';
import { ObjectId } from 'mongodb';

export default (_id: ObjectId, filter?: FilterInterface): Promise<ErrorHandler | Object> => {
    return new Promise((resolve, reject) => {
        const collection =  db.getCollection('ghcms_users', 'users');

        if(collection instanceof ErrorHandler) return reject(new ErrorHandler({
            severity: ErrorSeverity.NON_FATAL,
            id: new GUID('295cd853-d7fd-4e4b-bb88-f46cb576fbdc'),
            where: 'src\\core\\user_class\\src\\fetch.ts',
            function: 'getUser',
        }));

        // Find the user and use the filter
        const mergedFilter: any = [{
            $match: {
                _id: _id
            }
        }];

        // If the filter is defined, merge it with the default filter
        if(filter) mergedFilter.push({ $project: filter });

        // Execute the query
        collection.aggregate(mergedFilter).toArray().then((raw: any) => {
            // Check if the user was found
            if(raw?.length !== 1) return reject(new ErrorHandler({
                severity: ErrorSeverity.NON_FATAL,
                id: new GUID('e0d7d2e6-c8a0-4c1c-b09d-f8e8f9b9e3f7'),
                where: 'src\\core\\user_class\\src\\fetch.ts',
                function: 'getUser',
            }));

            // Return the user
            resolve(raw[0]);
        });
    });
}