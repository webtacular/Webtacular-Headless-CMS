import GUID from '../src/guid';

// Check if a guid is generated correctly
test('GUID generation', () => {
    const guid = new GUID(),
        guid2 = new GUID();

    expect(guid2.isValid(guid)).toBeDefined();
});

// Check if the toString method returns the correct value
test('GUID toString', () => {
    const uuid = 'fd6b9411-cb53-41a0-9774-1292b2372268';

    const guid = new GUID(uuid);

    expect(guid.toString()).toBe(uuid);
});


// Test a known valid GUID
test('GUID Validation (Known valid)', () => {
    const guid = new GUID();

    expect(guid.isValid('fd6b9411-cb53-41a0-9774-1292b2372268')).toEqual(true);
});

// Test a known invalid GUID
test('GUID Validation (Known invalid)', () => {
    const guid = new GUID();

    expect(guid.isValid('f0e4c2f76c58916ec258f246851bea0')).toEqual(false);
});

// Compare two GUIDs (class, class)
test('GUID comparison (class, class)', () => {
    const guid = new GUID(),
        guid2 = new GUID(guid);

    expect(guid.equals(guid2)).toEqual(true);
});

// Compare two GUIDs (class, string)
test('GUID comparison (class, string)', () => {
    const guid = new GUID(),
        guid2 = new GUID(guid);

    expect(guid.equals(guid2.toString())).toEqual(true);
});

// Compare two GUIDs (class, class) invalid
test('GUID comparison (class, class) invalid', () => {
    const guid = new GUID(),
        guid2 = new GUID();

    expect(guid.equals(guid2)).toEqual(false);
});

// Compare two GUIDs should return false (class, string)
test('GUID comparison (class, string) invalid', () => {
    const guid = new GUID(),
        guid2 = new GUID(guid);

    expect(guid.equals('f0e4c2f76c58916ec258f246851bea0')).toEqual(false);
});