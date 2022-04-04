import { SchemaProperty, Types } from '../../versioning/src/types';

export default (typeObject:SchemaProperty): {
    schema: string,
    type: string,
} => {
    const types: Array<Types[]> | Types[] = typeObject.acceptedTypes;
    
    //
    // Before we get started, GraphQL only supports a few types
    // - String
    // - Int
    // - Float
    // - Boolean
    // - ID (ObjectId)
    //
    // This means that we need to convert the accepted types into
    // GraphQL types, like date
    //

    let exportedSchemas: string[] = [],
        exportedTypes: string[] = [];

    for(let typeIndex in types) {
        const type: Types | Types[] = types[typeIndex];

        // Check if the type is an special type array
        // EG: [number, string]
        if(Array.isArray(type)) {
            // Generate the name of the type
            let typeName: string = type.map((t) => nameify(typesToGraphQL(t))).join('') + '_Array';

            // Create a GraphQL type for the array,
            // EG: [Number, Number, Number] to
            // type typeName { a1: Number, a2: Number, a3: Number }
            let types: string[] = [];

            // Create the array
            type.forEach((t, i) => types.push(`${nameify(typesToGraphQL(t))}_${i}: ${typesToGraphQL(t)}`));

            // Finally, create the type
            const schema: string = `type ${typeName} {${types.join(', ')}}`;

            // Add the schema to the list of schemas to export
            exportedSchemas.push(schema);

            // Add the type to the list of types to export
            exportedTypes.push(typeName);

            // Continue to the next type
            continue;
        }

        // If the type is not an special type array,
        // we can just return a the type from the typesToGraphQL
        // function

        exportedTypes.push(typesToGraphQL(type));
    };

    // If we have multiple types to export, we will need to
    // Create an union type for them
    let exportedType: string = '';

    if(exportedTypes.length > 1) {
        // Constuct a name for the union type
        exportedType = exportedTypes.map((t) => nameify(t.split('_')[0], 10)).join('_') + '_Union';

        // Constuct the union type
        exportedSchemas.push(`union ${exportedType} = ${exportedTypes.join(' | ')};`);

    // If we only have one type to export, we can just return
    // the first type
    } else exportedType = exportedTypes[0];

    // Return the data 
    return {
        schema: exportedSchemas.join('\n'),
        type: exportedType
    }
}

const typesToGraphQL = (type: Types): string => {
    switch (type) {
        case 'string': return 'String';
        case 'number': return 'Int';
        case 'boolean': return 'Boolean';
        case 'float': return 'Float';

        case 'date': return 'GHCMS_Date';
        case 'objectId': return 'GHCMS_ObjectId';
        case 'regex': return 'GHCMS_Regex';

        case 'array<string>': return '[String]';
        case 'array<number>': return '[Int]';
        case 'array<boolean>': return '[Boolean]';
        case 'array<array>': return '[GHCMS_Array]';
        case 'array<date>': return '[GHCMS_Date]';        
    }
}

// All this function does is capitalize the first letter of the string
// and cuts it off after the specified length.
const nameify = (name: string, lenght: number = 3, capitalizeFirst: boolean = true): string => {
    return name.toLowerCase().split('').map((char, index) => {
        if(index === 0 && capitalizeFirst) return char.toUpperCase();
        if(index >= lenght) return '';
        return char;
    }).join('');
}