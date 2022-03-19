import { ErrorHandler } from ".";
import GUID from "../general_library/src/guid";

test('Error handler date validation', () => {
    const error = {
        severity: 0,
        id: new GUID(),
        where: 'src\\core\\error_handler\\error.test.ts',
        function: 'constructor'
    };

    const errorHandler = new ErrorHandler(error);
    expect(errorHandler.date).toBeDefined();
});


test('Error handler severity validation', () => {
    const error = {
        severity: 0,
        id: new GUID(),
        where: 'src\\core\\error_handler\\error.test.ts',
        function: 'constructor'
    };

    const errorHandler = new ErrorHandler(error);
    expect(errorHandler.severity).toBeDefined();
});

test('Error handler severity validation (too high)', () => {
    const error = {
        severity: 4,
        id: new GUID(),
        where: 'src\\core\\error_handler\\error.test.ts',
        function: 'constructor'
    };

    expect(() => {
        const errorHandler = new ErrorHandler(error);
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
        const errorHandler = new ErrorHandler(error);
    }).toThrowError('Invalid severity');
});

test('Error handler id validation', () => {
    const error = {
        severity: 0,
        id: new GUID(),
        where: 'src\\core\\error_handler\\error.test.ts',
        function: 'constructor'
    };

    const errorHandler = new ErrorHandler(error);
    expect(errorHandler.id).toBeDefined();
});

test('Error handler id validation (invalid)', () => {
    const error = {
        severity: 0,
        id: new GUID(),
        where: 'src\\core\\error_handler\\error.test.ts',
        function: 'constructor'
    };

    const errorHandler = new ErrorHandler(error);
    expect(errorHandler.id).toBeDefined();
});

