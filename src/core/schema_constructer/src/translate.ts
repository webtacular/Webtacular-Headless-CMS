import { SchemaProperty, Types } from '../../versioning/src/types';
import { schemaValue } from './construct';

export default (typeObject: {
    [key: string]: schemaValue | SchemaProperty;
}) =>{
    // Translate the OBJ to a schema and rootValues
    // EG: typeObject = {
    //  group: {
    //      name: schemaValue,
    //      description: schemaValue,
    //  },
    //  userName: schemaValue,
    //  deeplyNested: {
    //      name: schemaValue,
    //      description: schemaValue,
    //      nested: {
    //          name: schemaValue,
    //      }
    // }
    // TO
    // type Query {
    //     group: Group,
    //     userName: String,
    //     deeplyNested: DeeplyNested,
    // }
    // type Group {
    //     name: String,
    //     description: String,
    // }
    // type DeeplyNested {
    //     name: String,
    //     nested: Nested,
    // }
    // type Nested {
    //     name: String,
    // }
    let schema: string = '';

    const recurse = (cur: {[key: string]: schemaValue | SchemaProperty} = {}, obj: any = typeObject, parentNames: string[] = []) => {
        for(const key in obj) {
            let value = obj[key];

            if(value instanceof schemaValue) {
                console.log(parentNames)
            }

            if(typeof value === 'object')
                recurse(cur, value, [...parentNames, key]);
        }

        return cur;
    }

    recurse();

    console.log(schema);
}