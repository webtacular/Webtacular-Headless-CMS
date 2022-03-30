import GUID from '../../general_library/src/guid';

export type Types = Array<
    'string' | 
    'number' | 
    'boolean' | 
    'object' | 
    'date' |
    'array' | 
    'array<string>' |
    'array<number>' |
    'array<boolean>' |
    'array<object>' |
    'array<array>' |
    'array<any>'
>;

export type TypeConstructor = {
    acceptedTypes: Array<Types> | Types, 
    defaultValue: any, 
    required: boolean, 
    description: string,
    private?: boolean,
    accessGroup?: Array<GUID | string>
};

export class SchemaProperty {
    acceptedTypes: Array<Types> | Types;
    defaultValue: any;
    required: boolean;
    description: string;

    private: boolean = true;
    accessGroup: Array<GUID | string> = [];

    constructor(val: TypeConstructor) {
        this.acceptedTypes = val.acceptedTypes;
        this.defaultValue = val.defaultValue;
        this.required = val.required;
        this.description = val.description;

        if (val.private) this.private = val.private;
    }

    validate(val: any): boolean {
        if (this.required === true && val === undefined)
            return false;

        if (this.required === false && val === undefined)
            return true;

        let value = false;

        this.acceptedTypes.forEach((type) => {
            // Date is a special case
            if (type === 'date') 
                if (val instanceof Date) value = true;
            
            const arrRegex = /^array(<([a-z]+)>){0,1}$/;
            let result: any;
            
            // This array type signifies that the value should be an array
            // of indfinite length, aslong as the type of the array elements
            // match that of the accepted array type.
            //
            // ---------[ Valid ]---------
            // type: array<string>
            // val: ['a', 'b', 'c']
            //
            // ---------[ Invalid ]---------
            // type: array<string>
            // val: ['a', 'b', 'c', 1]
            //
            if (result = arrRegex.exec(type.toString()) && Array.isArray(val)) {
                const arrType = result[2];
                let typeCheck = true;
  
                // Go through each element of the array and check if it matches
                // The accepted type.
                if (Array.isArray(val)) val.forEach((v) => {
                    if ((typeof v).toLowerCase() !== arrType)
                        typeCheck = false;
                });

                value = typeCheck;
            }

            // This signifies that the array contains specific types
            // that the value is meant to conform to.
            // 
            // ---------[ Valid ]---------
            // type:['string', 'number', 'boolean']
            // val: ['sssdf', 6, false]
            // 
            // --------[ Invalid ]--------
            // type: ['string', 'number', 'boolean']
            // val: ['dfghdfg', 4, false, false]
            //
            if (Array.isArray(type) && Array.isArray(val)) {
                let typeCheck = true;

                // Make sure both arrays are the same length
                if(val.length !== type.length) typeCheck = false;

                // Go through each element of the array and check if it matches
                else type.forEach((t, i) => {
                    if ((typeof val[i]).toLowerCase() !== t)
                        typeCheck = false;
                });

                value = typeCheck;
            }

            // Now that arrays have been handled, we can do an easy check
            // to see if the value matches the type.
            if ((typeof val).toLowerCase() === type.toString())
                value = true;
        });  

        return value;
    }
}