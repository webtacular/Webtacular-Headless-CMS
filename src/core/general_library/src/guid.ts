const validGuidRegex = /^[0-9a-f]{8}[-][0-9a-f]{4}[-][1-5][0-9a-f]{3}[-][89ab][0-9a-f]{3}[-][0-9a-f]{12}$/i;

class GUID {
    #guid = '';

    constructor(guid?: any) {
        // If no GUID is provided, generate a new one
        if(!guid) guid = genGuid();

        else if(guid instanceof GUID) guid = guid.toString();

        // Validate the GUID
        if(!validateGuid(guid)) throw new Error('Invalid GUID');

        // Set the GUID
        this.#guid = guid;
    }

    toString() {
        return this.#guid;
    }

    isValid(guid:any) {
        return validateGuid(guid);
    }

    equals(guid:any) {
        // Check if the guid is an instance of the GUID class
        if(guid instanceof GUID)
            return this.#guid === guid.toString();
        
        // Validate the GUID
        if(!validateGuid(guid)) return false;

        // Compare the GUIDs
        return this.#guid === guid;
    }
}

// Generate a new GUID
const genGuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Validate a GUID
const validateGuid = (guid: any): boolean => {
    // Check if the GUID is a class instance
    if (guid instanceof GUID)
        return true;
        
    return validGuidRegex.test(guid);
}

export default GUID;