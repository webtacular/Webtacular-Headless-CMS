import { buildSchema } from 'graphql';
import { gql } from '.';
import filter from './core/graphql_handler/src/filter';

export default async() => {
    
    //const userSchema = constructor.construct(UserSchema.config);
    

    gql.addSchema(buildSchema(`
        type user {name: [String], nameDescription: Boolean, nameIsUnique: Boolean, id: ID!, idDescription: Boolean, idIsUnique: Boolean}
        input userFilter {nameMatchesRegex: [String], nameIs: [String], nameIsNot: [String], nameExists: [Boolean], idIs: [String], idIsNot: [String], idExists: [Boolean]}
        type userCollection {total: Int, max: Int, items: [user]}
        type userQuery {user(id: ID!): user, userCollection(filter: userFilter): userCollection}

        type Query {user: userQuery, test: String}
    `),
    {
        user: (a:any,b:any,c:any,d:any) => {
            // Figure out what data has been requested
            const filterObject = filter(c);

            console.log(filterObject.arguments.user);
            console.log(filterObject.filter.user);

            return {
                userCollection: () =>{  
                    return {
                        total: 1,
                        max: 1,
                        items: [{
                            name: ['hello', 'world'],
                            id: '123',
                            nameDescription: true,
                            nameIsUnique: true,
                            idDescription: true,
                            idIsUnique: true,

                            resolveType:  'user'
                        }]
                    }
                },

            }

        },

    });

    return;
}