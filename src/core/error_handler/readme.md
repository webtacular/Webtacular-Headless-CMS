<h1 align="center">
    Error handler
</h1>

## Description

This module provides a simple error handler.

## Usage
```typescript

import { GUID from "general_library";
import { errorHandler } from "error_handler";

// severity: 
//  0 = non-fatal-user-fault (Function will try and recover), 
//  1 = non-fatal (Function will exit), 
//  2 = fatal (Server will exit)
//
// id: GUID for the error, which can be used by the localization module (Version 4)
// where: the file name and function name
// function: the function name
// log: boolean, if true (defualt), the error will be logged
const error = new errorHandler.handle(
    {
        severity: 0,
        id: new GUID('0D9E8E9F-E9E9-4D9E-9E9E-9E9E9E9E9E9E'),
        where: 'src\core\error_handler\readme.md',
        function: 'main'
    }
);

// error.severity: Error severity
// error.key: Error key
// error.where: Error location
// error.function: Error function
// error.date: Error date
// error.id: Unique error ID
```

## ToDo

Add a way to log errors to a file