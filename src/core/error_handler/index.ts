export interface ErrorDescription {
    severity: number;
    id: string;
    where: string;
    function: string;
}

export class ErrorHandler {
    constructor(
        error: ErrorDescription,
        log: boolean = true
    ) {
        
    }
}