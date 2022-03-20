import { errorHandler } from ".";
import GUID from "../general_library/src/guid";

test('Error handler date validation', () => {
    const error = {
        severity: 0,
        id: new GUID(),
        where: 'src\\core\\error_handler\\error.test.ts',
        function: 'constructor'
    };

    const ErrorHandler = new errorHandler.handle(error);
    expect(ErrorHandler.date).toBeDefined();
});


test('Error handler severity validation', () => {
    const error = {
        severity: 0,
        id: new GUID(),
        where: 'src\\core\\error_handler\\error.test.ts',
        function: 'constructor'
    };

    const ErrorHandler = new errorHandler.handle(error);
    expect(ErrorHandler.severity).toBeDefined();
});

test('Error handler severity validation (too high)', () => {
    const error = {
        severity: 4,
        id: new GUID(),
        where: 'src\\core\\error_handler\\error.test.ts',
        function: 'constructor'
    };

    expect(() => {
        const ErrorHandler = new errorHandler.handle(error);
    }).toThrowError('Invalid severity');
});

test('Error handler severity validation (to low)', () => {
    const error = {
        severity: -1,
        id: new GUID(),
        where: 'src\\core\\error_handler\\error.test.ts',
        function: 'constructor'
    };

    expect(() => {
        const ErrorHandler = new errorHandler.handle(error);
    }).toThrowError('Invalid severity');
});

test('Error handler id validation', () => {
    const error = {
        severity: 0,
        id: new GUID(),
        where: 'src\\core\\error_handler\\error.test.ts',
        function: 'constructor'
    };

    const ErrorHandler = new errorHandler.handle(error);
    expect(ErrorHandler.id).toBeDefined();
});

test('Error handler id validation (invalid)', () => {
    const error = {
        severity: 0,
        id: new GUID(),
        where: 'src\\core\\error_handler\\error.test.ts',
        function: 'constructor'
    };

    const ErrorHandler = new errorHandler.handle(error);
    expect(ErrorHandler.id).toBeDefined();
});

