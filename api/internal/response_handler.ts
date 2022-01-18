// ooooo   ooooo ooooooooooooo ooooooooooooo ooooooooo.   
// `888'   `888' 8'   888   `8 8'   888   `8 `888   `Y88. 
//  888     888       888           888       888   .d88' 
//  888ooooo888       888           888       888ooo88P'  
//  888     888       888           888       888         
//  888     888       888           888       888         
// o888o   o888o     o888o         o888o     o888o        
// HTTP section

//This is an object that contains all the http codes and their descriptions
export const httpCodes: { [key:number]: string } = {
    100 : "CONTINUE",
    101 : "SWITCHING_PROTOCOLS",
    102 : "PROCESSING",
    103 : "EARLY_HINTS",
    200 : "OK",
    201 : "CREATED",
    202 : "ACCEPTED",
    203 : "NON_AUTHORITATIVE_INFORMATION",
    204 : "NO_CONTENT",
    205 : "RESET_CONTENT",
    206 : "PARTIAL_CONTENT",
    207 : "MULTI_STATUS",
    208 : "ALREADY_REPORTED",
    226 : "IM_USED",
    300 : "MULTIPLE_CHOICES",
    301 : "MOVED_PERMANENTLY",
    302 : "FOUND",
    303 : "SEE_OTHER",
    304 : "NOT_MODIFIED",
    305 : "USE_PROXY",
    307 : "TEMPORARY_REDIRECT",
    308 : "PERMANENT_REDIRECT",
    400 : "BAD_REQUEST",
    401 : "UNAUTHORIZED",
    402 : "PAYMENT_REQUIRED",
    403 : "FORBIDDEN",
    404 : "NOT_FOUND",
    405 : "METHOD_NOT_ALLOWED",
    406 : "NOT_ACCEPTABLE",
    407 : "PROXY_AUTHENTICATION_REQUIRED",
    408 : "REQUEST_TIMEOUT",
    409 : "CONFLICT",
    410 : "GONE",
    411 : "LENGTH_REQUIRED",
    412 : "PRECONDITION_FAILED",
    413 : "PAYLOAD_TOO_LARGE",
    414 : "URI_TOO_LONG",
    415 : "UNSUPPORTED_MEDIA_TYPE",
    416 : "RANGE_NOT_SATISFIABLE",
    417 : "EXPECTATION_FAILED",
    418 : "IM_A_TEAPOT",
    421 : "MISDIRECTED_REQUEST",
    422 : "UNPROCESSABLE_ENTITY",
    423 : "LOCKED",
    424 : "FAILED_DEPENDENCY",
    425 : "TOO_EARLY",
    426 : "UPGRADE_REQUIRED",
    428 : "PRECONDITION_REQUIRED",
    429 : "TOO_MANY_REQUESTS",
    431 : "REQUEST_HEADER_FIELDS_TOO_LARGE",
    451 : "UNAVAILABLE_FOR_LEGAL_REASONS",
    500 : "INTERNAL_SERVER_ERROR",
    501 : "NOT_IMPLEMENTED",
    502 : "BAD_GATEWAY",
    503 : "SERVICE_UNAVAILABLE",
    504 : "GATEWAY_TIMEOUT",
    505 : "HTTP_VERSION_NOT_SUPPORTED",
    506 : "VARIANT_ALSO_NEGOTIATES",
    507 : "INSUFFICIENT_STORAGE",
    508 : "LOOP_DETECTED",
    509 : "BANDWIDTH_LIMIT_EXCEEDED",
    510 : "NOT_EXTENDED",
    511 : "NETWORK_AUTHENTICATION_REQUIRED",
}

/**
 * This function is used to respond to an http request with an error code and message
 * 
 * @param statusCode number - HTTP error code, if not provided or invalid, defaults to 500
 * @param res any - the response object
 * @param message string - the message to send to the client, optuonal
 */
export function httpErrorHandler(statusCode:number, res:any, message?:string, headers?:any):void {
    httpRespone(statusCode, res, false, message, headers);
}

/**
 * This function is used to respond to an http request with an success code and message
 * 
 * @param statusCode number - HTTP error code, if not provided or invalid, defaults to 500
 * @param res any - the response object
 * @param message string - the message to send to the client, optuonal
 */
export function httpSuccessHandler(statusCode:number, res:any, message?:string, headers?:any):void {
    httpRespone(statusCode, res, true, message, headers);
}

function httpRespone(statusCode:number, res:any, success:boolean, message?:string, headers?:any):void {
    // if any headers are provided, add them to the response
    if(headers) res.set(headers);

    // Check if the error code is valid
    if (statusCode in httpCodes !== true) statusCode = 500;

    // respond with the error code and message and close the connection
    res.status(statusCode).send(JSON.stringify({
        success,
        status_code: statusCode,
        status_message: httpCodes[statusCode],
        message: message || ''
    })).end();
}

// ooo        ooooo                                            oooooooooo.   oooooooooo.  
// `88.       .888'                                            `888'   `Y8b  `888'   `Y8b 
//  888b     d'888   .ooooo.  ooo. .oo.    .oooooooo  .ooooo.   888      888  888     888 
//  8 Y88. .P  888  d88' `88b `888P"Y88b  888' `88b  d88' `88b  888      888  888oooo888' 
//  8  `888'   888  888   888  888   888  888   888  888   888  888      888  888    `88b 
//  8    Y     888  888   888  888   888  `88bod8P'  888   888  888     d88'  888    .88P 
// o8o        o888o `Y8bod8P' o888o o888o `8oooooo.  `Y8bod8P' o888bood8P'   o888bood8P'  
//                                        d"     YD                                       
//                                        "Y88888P'                                       
// MongoDB section

//This is an object that contains some the mongoDB error codes and their descriptions
export const mongoErrorCodes: { [key:number]: { error:string, code:number } } = {
    11000 : {
        error: "DUPLICATE_KEY_ERRROR",
        code: 409,
    },
    11001 : {
        error: "DUPLICATE_KEY_ERRROR",
        code: 409,
    },
}

/**
 * This function is used handle mongoDB errors, it will respond to the client with the appropriate error code and message
 * 
 * @param errorCode number - MongoDB error code, if not provided or invalid, defaults to 500
 * @param res any - the response object
 * @param message string - the message to send to the client, optuonal
 */
export function mongoErrorHandler(errorCode:number, res:any, message?:string):void {
    // Check if the error code is valid
    if (errorCode in mongoErrorCodes !== true) return httpErrorHandler(500, res, returnLocal(locals.KEYS.DATABASE_UNKNOWN_ERROR, res.language));

    // respond with the error code and message and close the connection
    res.status(mongoErrorCodes[errorCode].code).send(JSON.stringify({
        success: false,
        status_code: mongoErrorCodes[errorCode].code,
        status_message: mongoErrorCodes[errorCode].error,
        message: message || ''
    })).end();
}

// ooooo          .oooooo.     .oooooo.         .o.       ooooo         .oooooo..o 
// `888'         d8P'  `Y8b   d8P'  `Y8b       .888.      `888'        d8P'    `Y8 
//  888         888      888 888              .8"888.      888         Y88bo.      
//  888         888      888 888             .8' `888.     888          `"Y8888o.  
//  888         888      888 888            .88ooo8888.    888              `"Y88b 
//  888       o `88b    d88' `88b    ooo   .8'     `888.   888       o oo     .d8P 
// o888ooooood8  `Y8bood8P'   `Y8bood8P'  o88o     o8888o o888ooooood8 8""88888P'  

// Exports the locals language object
export const locals = require('../locals.json');

/**
 * This function is used to return a localized string from the locals.json file
 * 
 * @param key string - the key to get the value of
 * @param lang string - the language to get the value of, defaults to 'en'
 * @returns 
 */
export function returnLocal(key:string, lang:string = 'EN', conCat?:any) {
    key = key?.toUpperCase();
    lang = lang?.toUpperCase();

    // Check if the key exists in the locales object
    if (key in locals[lang] !== true) return key;

    let string:string = locals[lang][key];

    if(conCat) Object.keys(conCat).forEach((key:string, i:number) => 
        string = string.replace(`{${i}}`, conCat[key]));

    // if it does, return the value
    return string;
}

export interface AvailableLanguagesInterface {
    [key:string]: {
        variants: Array<string>, 
        defualt:string 
    }
}

export interface LanguageInterface {
    language:string, 
    variant:string, 
    weight:number 
}

/**
 * This express middleware is used to check if the client provided a language(s) request header,
 * it will check if we support that language, if not, it will default to the language specified in the 'defaultLanguage' parameter
 * 
 * @param availableLanguages AvailableLanguagesInterface - the languages that are available for the client to choose from, in 2 letter ISO format and an array of region variants and the default variant
 * @param defaultLanguage string - the default language to use if the client does not specify one, in 2 letter ISO format
 */
export function localMiddleware(availableLanguages:AvailableLanguagesInterface, defaultLanguage:string = 'EN') {
    return (req:any, res:any, next:any) => {
        let langObj:LanguageInterface = {
            language: defaultLanguage,
            variant: availableLanguages[defaultLanguage].defualt,
            weight: 0.0,
        };

        // Check if header exists, if not set it to the default language
        // or if the user provided an empty 'availableLanguages' array, set it to the default language
        if(!req.headers['accept-language'] || Object.keys(availableLanguages).length === 0) {
            req.language = langObj;
            res.language = langObj;
            return next();
        }

        // This regex will match the language code from the header and the language weight
        //
        // Example - de;q=0.9, fr-CH, en;q=0.8
        //
        // ([a-zA-Z]{2}) -- Checks for the 2 letter country code (en, fr, etc) -> en-US = en
        // [-;] -- Checks where the 2 letter languae code ends, eg de(;)q=0.9 or fr(-)CH
        // ([a-zA-Z]{2}) -- Checks for the 2 letter region code (US, UK, etc) -> en-US = US
        // (q=([01].[0-9])) -- Checks for the q=0.0 part of the language code, and gets the float, eg en;q=0.9 -> 0.9
        //
        const lang_regex:RegExp = /([a-zA-Z]{2})(-([a-zA-Z]{2}))*[;,](q=([01].[0-9]))*/gm;

        // Simple object to hold the languages and their weight values
        let languages:{ [key: string]: {
                region:string, 
                weight:number 
            } 
        } = {};

        let m:any;
        while((m = lang_regex.exec(req.headers['accept-language'])) !== null) {
            // Parse the weight of the language, if it doesn't exist, set it to 0.1
            // and if it is greater than 1, set it to 1
            let weight = (parseFloat(m[5]) > 1.0 ? 1.0 : parseFloat(m[5])) || 0.1,
                name = m[1].toUpperCase(),
                region = m[3]?.toUpperCase();

            // If e.g EN is already in the object, we keep the higher weight
            if(languages[name]?.weight > weight) continue;   

            // If the language variant is not in the available languages variant, try to get the default variant
            if(!availableLanguages[name]?.variants?.includes(region)) 
                if(availableLanguages[name]?.defualt) region = availableLanguages[name].defualt;
                else region = '';

            // Otherwise we add it to the object
            Object.assign(languages, {
                [name]: {
                    weight: weight,
                    region: region,
                }
            });
        }

        // Sort the languages by weight
        for(let language in languages) {
            if(Object.keys(availableLanguages).includes(language) && languages[language].weight > langObj.weight) langObj = { 
                language,
                weight: languages[language].weight, 
                variant: languages[language].region
            };
        }

        // Set the language to the request
        req.language = langObj;
        res.language = langObj;

        // Continue with the request
        next();
    }
}

// export function verifyLocals(obj:any){
//     if(!obj?.supported_languages) throw new Error('The supported_languages property is not properly defined in the locals.json file');
//     if(!obj?.KEYS) throw new Error('The KEYS property is not properly defined in the locals.json file');

//     const language_regex = /^[A-Z]{2}$/,
//         skip_keys = ['supported_languages', 'KEYS'];

//     let local_keys:any = {};

//     Object.keys(obj).forEach(key => {

//         //Non valid country code
//         if(!language_regex.test(key) && !skip_keys.includes(key))
//             throw new Error(`The key ${key} is not a valid language code, it must be in 2 letter ISO format (e.g. EN, FR, etc)`);
        
//         //save the valid keys for later
//         if(language_regex.test(key))
//             local_keys[key] = obj[key];
        
//     });

//     Object.keys(obj.supported_languages).forEach(key => {
        
//         // VARIATIONS ARRAY VALIDATION
//         if(!language_regex.test(key))
//             throw new Error(`The key ${key} is not a valid language code, it must be in 2 letter ISO format (e.g. EN, FR, etc)`);

//         if(!obj.supported_languages[key].variants)
//             throw new Error(`The key ${key} is required to have a variants string array, even if its empty`);
        
//         Object.keys(obj.supported_languages[key].variants).forEach(variant => {
//             if(!language_regex.test(variant))
//                 console.log(variant)
//         });

//         //DEFAULT VARIANT VALIDATION
        
//         if(!obj.supported_languages[key].defualt)
//             throw new Error(`The key ${key} is required to have a default variant`);

//         if(!language_regex.test(obj.supported_languages[key].defualt))
//             throw new Error(`The key ${key} has an invalid default variant ${obj.supported_languages[key].defualt}, it must be in 2 letter ISO format`);
//     });
    
//     //Check if all the keys are defined
//     Object.keys(local_keys).forEach(language => {
//         const language_keys = local_keys[language];

//         Object.keys(obj.KEYS).forEach(required_key => {
//             // if a key is defined in KEYS but not in the language object, throw an error
//             if(!language_keys[required_key])
//                 throw new Error(`The key ${required_key} is not defined in the ${language} language object`);

//             // if a key in KEYS is not the same as its value, throw an error
//             if(required_key !== obj.KEYS[required_key])
//                 throw new Error(`${required_key} string property (${obj.KEYS[required_key]}) is required to be the same as the KEY`);
//         });
//     });
    
// }