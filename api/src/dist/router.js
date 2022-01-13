"use strict";
exports.__esModule = true;
exports.strictRest = void 0;
var common_1 = require("./common");
exports["default"] = (function (resource, app, aditionalResources) {
    var resources = ["/" + resource];
    app.all("" + resources[0], function (req, res) { return methodManager(resources, req, res); });
    console.log(('GET' || 'POST' || 'PUT' || 'DELETE'));
    switch (('GET' || 'POST' || 'PUT' || 'DELETE')) {
        case true:
            return objectResourceManager(resources, aditionalResources, app);
        case false:
            return arrayResourceManager(resources, aditionalResources, app);
        default:
            return;
    }
});
var objectResourceManager = function (resources, aditionalResources, app) {
    var func = function (method, resource, callback) {
        switch (method) {
            case 'GET': return app.get(resource, callback);
            case 'POST': return app.post(resource, callback);
            case 'DELETE': return app["delete"](resource, callback);
            case 'PUT': return app.put(resource, callback);
        }
        ;
    };
    Object.keys(aditionalResources).forEach(function (method) {
        var extraResourcesArray = aditionalResources[method];
        extraResourcesArray.forEach(function (extraResource) {
            return func(method, "/" + resources[0] + "/" + extraResource, function (req, res) { return methodManager(resources, req, res); });
        });
    });
};
var arrayResourceManager = function (resources, aditionalResources, app) {
    aditionalResources.forEach(function (extraResources) {
        return app.all("/" + resources[0] + "/" + extraResources, function (req, res) { return methodManager(resources, req, res); });
    });
};
var methodManager = function (resources, req, res) {
    var methodRouter = {
        GET: function (req, res) {
            return require("./" + resources[0] + "/get")["default"](req, res);
        },
        POST: function (req, res) {
            return require("./" + resources[0] + "/post")["default"](req, res);
        },
        DELETE: function (req, res) {
            return require("./" + resources[0] + "/delete")["default"](req, res);
        },
        PUT: function (req, res) {
            return require("./" + resources[0] + "/put")["default"](req, res);
        }
    };
    try {
        methodRouter[req.method](req, res, resources);
    }
    catch (_a) {
        common_1.errorHandler(501, res);
    }
};
function strictRest(req, res, next) {
    if (['GET', 'POST', 'DELETE', 'PUT'].includes(req.method) === true)
        next();
    else
        common_1.errorHandler(405, res);
}
exports.strictRest = strictRest;
