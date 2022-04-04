import GUID from '../../general_library/src/guid';

export type Types =
    'string' | 
    'number' | 
    'boolean' | 
    'float' |
    'date' |
    'objectId' |
    'regex' |
    'array<string>' |
    'array<number>' |
    'array<boolean>' |
    'array<array>' |
    'array<date>';

export type acceptedTypes = Array<Types[]> | Types[]; 

export class key {
    key: any;

    constructor(key: any) {
        this.key = key;
    }
}

export type TypeConstructor = {
    acceptedTypes: acceptedTypes, 
    defaultValue: any, 
    required: boolean, 
    description: string,
    private?: boolean,

    databasePath?: string,

    accessGroup?: Array<GUID | string>
    modifyGroup?: Array<GUID | string>
    
    affects?: Array<string>
    key?: string

    toView?: (value: key) => boolean,
    toEdit?: (value: key, newValue: any) => boolean,
};

export class SchemaProperty {
    arrRegex = /^array(<([a-z]+)>){0,1}$/;

    acceptedTypes: acceptedTypes;
    defaultValue: any;
    required: boolean;
    description: string;

    private: boolean = true;

    // Makes it so that by default, administrators can access this property
    accessGroup: Array<GUID | string> = ['administrator'];
    modifyGroup?: Array<GUID | string> = ['administrator'];

    affects: Array<string> = [];

    constructor(val: TypeConstructor) {
        this.acceptedTypes = val.acceptedTypes;
        this.defaultValue = val.defaultValue;
        this.required = val.required;
        this.description = val.description;

        if (val.private) this.private = val.private;

        if (val.accessGroup) this.accessGroup.push(...val.accessGroup);
        if (val.modifyGroup) this.modifyGroup?.push(...val.modifyGroup);
        if (val.affects) this.affects.push(...val.affects);
    }

    validate(val: any): boolean {
        // If the value is undefined, and the property is required, return false
        if (this.required === true && val === undefined)
            return false;

        // If no value is give, and the property is not required, return true
        if (this.required === false && val === undefined)
            return true;

        let value = false;

        this.acceptedTypes.forEach((type) => {
            // regex is a special case
            if (type === 'regex')
                if (val instanceof RegExp)
                    value = true;

            // Date is a special case
            if (type === 'date') 
                if (val instanceof Date) value = true;
            
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
            if (result = this.arrRegex.exec(type.toString()) && Array.isArray(val)) {
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