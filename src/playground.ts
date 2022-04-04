import constructor from './core/schema_constructer';
import { UserSchema } from './core/user_class/def/000';
import { buildSchema } from 'graphql';
import { gql } from '.';

export default async() => {
    
    const userSchema = constructor.construct(UserSchema.config);


    //gql.addSchema(buildSchema(userSchema));

    return;
}