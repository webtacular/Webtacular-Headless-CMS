import { isResourceInterface, ResourceInterface, RouterCallback} from './interfaces';
import { errorHandler } from './common';

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

    //checks if the aditionalResources is an array or an object
    switch(isResourceInterface(aditionalResources)){
        case true:
            return objectResourceManager(resource, aditionalResources as ResourceInterface, app);

        case false:
            return arrayResourceManager(resource, aditionalResources as Array<string> | [], app);
        
        default:
            return;
    }
}

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

    let func = (method:string, resource:string, callback:RouterCallback) => {
        switch(method){
            case 'GET': return app.get(resource, callback);
            case 'POST': return app.post(resource, callback);
            case 'DELETE': return app.delete(resource, callback);
            case 'PUT': return app.put(resource, callback);
        };
    };

    Object.keys(aditionalResources).forEach((method:string) => {
        let extraResourcesArray:Array<string> = aditionalResources[(method as keyof ResourceInterface)] as Array<string>; 

        extraResourcesArray.forEach((extraResource:string) =>
            func(method, `/${resource}/${extraResource}`, (req:any, res:any) => methodManager(req, res, resource)));
    });
}

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
    (aditionalResources as Array<string>).forEach((extraResources:string) =>
        app.all(`/${resource}/${extraResources}`, (req:any, res:any) => methodManager(req, res, resource))); 
}

let methodManager = (req:any, res:any, resource:string):void => {
    try { 
        let resources:Array<string> = [req.url.split('/').slice(1), req.params];
        require(`./${resource}/${req.method}`).default(req, res, resources);
    } catch {
        errorHandler(501, res);
    }
}

/**
 * Express middle ware that only allows CRUD methods to access resources
 * GET POST PUT DELETE
 * @param req 
 * @param res 
 * @param next 
**/
export function strictRest(req:any, res:any, next:any):void {
    if(['GET', 'POST', 'DELETE', 'PUT'].includes(req.method) === true) next();
    else errorHandler(405, res);
}