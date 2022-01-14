import { isResourceInterface, ResourceInterface, RouterCallback} from './interfaces';
import { httpErrorHandler } from './response_handler';

/**
 * This function takes in a path to a directory and maps each file to a specific method for that resource.
 * 
 * The resource folder should be structured as follows:
 *  - name/get.ts
 *  - name/post.ts
 *  - name/delete.ts
 *  - name/put.ts
 * 
 * @param route string - The route to be forwarded to the correct module
 * @param app any - Express app
 * @param aditionalResources Array<string> | ResourceInterface - Array that contains either a non-method specific resource array or an ResourceInterface object that contains method specific resource arrays
**/
export default (resource:string, app:any, aditionalResources?:Array<string> | ResourceInterface) => {
    app.all(`/${resource}`, (req:any, res:any) => methodManager(req, res, resource)); 

    //checks if the aditionalResources is an array or an object,
    //We have to do this because the user can pass in an array or an object.
    switch(isResourceInterface(aditionalResources)){
        case true:
            //if it is an object, it will call the objectResourceManager
            return objectResourceManager(resource, aditionalResources as ResourceInterface, app);

        case false:
            //if it is an array, it will call the arrayResourceManager
            return arrayResourceManager(resource, aditionalResources as Array<string> | [], app);
    }
}


//   .oooooo.    .o8           o8o                         .   
//  d8P'  `Y8b  "888           `"'                       .o8   
// 888      888  888oooo.     oooo  .ooooo.   .ooooo.  .o888oo 
// 888      888  d88' `88b    `888 d88' `88b d88' `"Y8   888   
// 888      888  888   888     888 888ooo888 888         888   
// `88b    d88'  888   888     888 888    .o 888   .o8   888 . 
//  `Y8bood8P'   `Y8bod8P'     888 `Y8bod8P' `Y8bod8P'   "888" 
//                             888                             
//                         .o. 88P                             
//                         `Y888P                              
/** 
* This fuction takes in an object, which the user can use to create method specific resource endpoints
*
* Example:
* { POST: [':id] }
*
* This will create a resource that only allows POST requests to the /x/:id resource
@param resources Array<string> - Should only contain the first parameter of the function
@param aditionalResources ResourceInterface - Object that contains the method specific resource endpoints
@param app any - Express app
**/
let objectResourceManager = (resource:string, aditionalResources:ResourceInterface, app:any):void => {
    //Maps the resource to the correct method with a simple function
    let func = (method:string, resource:string, callback:RouterCallback) => {
        switch(method){
            case 'GET': return app.get(resource, callback);
            case 'POST': return app.post(resource, callback);
            case 'DELETE': return app.delete(resource, callback);
            case 'PUT': return app.put(resource, callback);
        };
    };

    //Go trough each method in the aditionalResources object and check if it has a resource
    //If it does, it will call the func function and pass in the resource and the callback
    Object.keys(aditionalResources).forEach((method:string) => {
        //Do some funky typescript stuff to get the array of resources from the object
        let extraResourcesArray:Array<string> = aditionalResources[(method as keyof ResourceInterface)] as Array<string>; 

        //Go trough each resource in the array and call the func function
        extraResourcesArray.forEach((extraResource:string) =>
            func(method, `/${resource}/${extraResource}`, (req:any, res:any) => methodManager(req, res, resource)));
    });
}


//  .oooo.   oooo d8b oooo d8b  .oooo.   oooo    ooo 
// `P  )88b  `888""8P `888""8P `P  )88b   `88.  .8'  
//  .oP"888   888      888      .oP"888    `88..8'   
// d8(  888   888      888     d8(  888     `888'    
// `Y888""8o d888b    d888b    `Y888""8o     .8'     
//                                       .o..P'      
//                                       `Y8P'       
/** 
* This fuction takes in an String array, which the user can use to create non-method specific resources enpoints
*
* Example:
* [':id', ':id/profile_picture']
*
* This will create a resource that only allows any CRUD method to access /x/:id || /x/id/profile_picture resources
@param resources Array<string> - Should only contain the first parameter of the function
@param aditionalResources Array<string> - Array that contains the non-method specific resource endpoints
@param app any - Express app
**/
let arrayResourceManager = (resource:string, aditionalResources:Array<string>, app:any):void => {
    //Go trough each resource in the array and call the func function
    (aditionalResources as Array<string>).forEach((extraResources:string) =>
        app.all(`/${resource}/${extraResources}`, (req:any, res:any) => methodManager(req, res, resource))); 
}

let methodManager = (req:any, res:any, resource:string):void => {
    try { 
        //get the resource path from the request
        let resources:Array<string> = [req.url.split('/').slice(1), req.params];

        //and call the method specific function function
        require(`./${resource}/${req.method}`).default(req, res, resources);
    } catch {
        //if the method specific function doesn't exist, return a 501 Not Implemented error
        return httpErrorHandler(501, res);
    }
}

// ooo. .oo.  .oo.   oooo oooo    ooo 
// `888P"Y88bP"Y88b   `88. `88.  .8'  
//  888   888   888    `88..]88..8'   
//  888   888   888     `888'`888'    
// o888o o888o o888o     `8'  `8'     
/**
 * Express middle ware that only allows CRUD methods to access resources
 * GET POST PUT DELETE
 * @param req 
 * @param res 
 * @param next 
**/
export function strictRest(req:any, res:any, next:any):void {
    //if the method is not one of the CRUD methods, return a 405 Method Not Allowed error
    if(['GET', 'POST', 'DELETE', 'PUT'].includes(req.method) === true) next();
    else return httpErrorHandler(405, res);
}