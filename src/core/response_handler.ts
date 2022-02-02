// Exports the locals language object
export const locals = require('../locals.json');

/**
 * This function is used to return a localized string from the locals.json file
 * 
 * @param key string - the key to get the value of
 * @param lang string - the language to get the value of, defaults to 'en'
 * @returns string - the localized string
 */
export function returnLocal(key:string, lang:string = 'EN', conCat?:any):string {
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