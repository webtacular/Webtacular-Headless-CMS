//create a basic express js server
const express:any = require('express'),
    bodyParser = require('express-body-parser-error-handler'),
    { json } = require('body-parser'),
    app:any = express();

const port:number = 3000,
    maxBodySize:number = 250;

import { errorHandler } from './src/common';

app.use('/', json({limit: maxBodySize}));
app.disable("x-powered-by");

//body parser error handler
app.use(function (error:any, req:any, res:any, next:any){
    errorHandler(error.statusCode, res, `${error.message}${(() => {
        if(error.statusCode === 413) return `, max body size: ${maxBodySize} bytes`;
        else return '';
    })()}`);
});

app.listen(port, (error:any) => {
    if (error) console.error(error);
    else console.log(`Server listening on port: ${port}`);
});

//
// routes
//

import { default as route, strictRest } from './src/router';

//Express middleware that only allows POST, PUT, DELETE and GET requests
app.use(strictRest);

//link URI
route('link', app, { 
    POST: [':id', ':id/pfp'],
    GET: [':id'],
});

//Users resource
route('users', app, { 
    POST: [':id'],
    GET: [':id'],
});

//
//Cataches all other routes and sends a 404 error
//
app.all('/*', (req:any, res:any) =>
    errorHandler(404, res, 'Resource not found')
);