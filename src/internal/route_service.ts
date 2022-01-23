import { isResourceInterface, ResourceInterface, RouterCallback } from './interfaces';
import { httpErrorHandler } from './response_handler';

//TODO: Add proper path validation

/**
 * This function takes in a path to a directory and maps each file to a specific method for that resource.
 * 
 * The resource folder should be structured as follows:
 *  - name/get.ts
 *  - name/post.ts
 *  - name/delete.ts
 *  - name/put.ts
 * 
 * @param path string - The path to the directory containing the resources
 * @param route string - the resource endpoint that the user will send requests to
 * @param app any - Express app
 * @param aditionalResources Array<string> | ResourceInterface - Array that contains either a non-method specific resource array or an ResourceInterface object that contains method specific resource arrays
**/
export default (path:string, resource:string, app:any, aditionalResources?:Array<string> | ResourceInterface) => {
    app.all(`/${resource}`, (req:any, res:any) => methodManager(path, req, res)); 

    //checks if the aditionalResources is an array or an object,
    //We have to do this because the user can pass in an array or an object.
    switch(isResourceInterface(aditionalResources)){
        case true:
            //if it is an object, it will call the objectResourceManager
            return objectResourceManager(path, resource, aditionalResources as ResourceInterface, app);

        case false:
            //if it is an array, it will call the arrayResourceManager
            return arrayResourceManager(path, resource, aditionalResources as Array<string> | [], app);
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
let objectResourceManager = (path:string, resource:string, aditionalResources:ResourceInterface, app:any):void => {
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
            func(method, `/${resource}/${extraResource}`, (req:any, res:any) => methodManager(path, req, res)));
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
let arrayResourceManager = (path:string, resource:string, aditionalResources:Array<string>, app:any):void => {
    //Go trough each resource in the array and call the func function
    (aditionalResources === undefined ? [] : aditionalResources as Array<string>).forEach((extraResources:string) =>
        app.all(`/${resource}/${extraResources}`, (req:any, res:any) => methodManager(path, req, res))); 
}

//this function is responsible for calling the correct method based on the request method
let methodManager = (path:string, req:any, res:any):void => {
    try { 
        //get the resource path from the request
        let resources:Array<string> = [req.url.split('/').slice(1), req.params, req.query];

        //and call the method specific function function
        require(`${path}/${req.method}`).default(req, res, resources);

    } catch (err) { //TODO: Better error repoting
        //log any errors for now
        console.log(err)

        //if the method specific function doesn't exist, return a 501 Not Implemented error
        return httpErrorHandler(501, res);
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
    //if the method is not one of the CRUD methods, return a 405 Method Not Allowed error
    if(['GET', 'POST', 'DELETE', 'PUT'].includes(req.method) === true) next();
    else return httpErrorHandler(405, res);
}