import general from "../general_library/";
import GUID from '../general_library/src/guid';

export interface ErrorDescription {
    severity: number;
    id: GUID;
    where: string;
    function: string;
}

export type ErrorSeverity = 0 | 1 | 2;

export class ErrorHandler {
    log?: boolean;
    severity?: ErrorSeverity;
    key?: GUID;
    where?: string;
    date?: Date;
    id?: GUID;

    constructor(
        error: ErrorDescription,
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
        this.id = new general.GUID();
    }
}