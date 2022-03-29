import general from "../general_library/";
import GUID from '../general_library/src/guid';

 //  0 = non-fatal-user-fault (Function will try and recover), 
//  1 = non-fatal (Function will exit), 
//  2 = fatal (Server will exit)
export type ErrorSeverity = 0 | 1 | 2;
    
export interface ErrorDescription {
    // Severity of the error
    severity: number;

    // Unique ID of the error
    id: GUID;

    // Where the error occured, in the format: "src\\core\\error_handler\\error.test.ts"
    where: string;

    // Function that caused the error
    function: string;
}

export const ErrorSeverity: {
    FATAL: ErrorSeverity;
    NON_FATAL: ErrorSeverity;
    USER_FAULT: ErrorSeverity;
} = {
    FATAL: 0,
    NON_FATAL: 1,
    USER_FAULT: 2
};

export class ErrorHandler {
    log?: boolean;
    severity?: ErrorSeverity;
    key?: GUID;
    where?: string;
    date?: Date;
    id?: GUID;
    function?: string;

    /*
        This class is used to standardize error handling and error reporting.

        @param {ErrorDescription} error - The error description
        @param {boolean} log - Whether or not to log the error
    */
    constructor(
        // Error details
        error: ErrorDescription,

        // Should the error be logged?
        log: boolean = true
    ) {
        // Validate the severity
        if (error.severity < 0 || error.severity > 3)
            throw new Error('Invalid severity');

        // Set the properties
        this.log = log;
        this.severity = error.severity as ErrorSeverity;
        this.key = error.id;
        this.where = error.where;
        this.date = new Date();
        this.function = error.function;
        this.id = new general.GUID();
    }
}