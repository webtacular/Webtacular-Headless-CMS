// We want to test the configuration class, as everything else has built in error checking.

import path from "path";
import Configuration from ".";
import fs from "fs";

test('Configuration class (Double instance)', () => {
    // Create a new configuration
    new Configuration();

    // Make sure that the class can only be instantiated once
    expect(() => {
        new Configuration();
    }).toThrowError('Configuration can only be instantiated once');
});

test('Configuration class (Valid path)', () => {
    // if a test.yml file exists, delete it
    if(fs.existsSync(path.join(__dirname, 'test.yml')))
        fs.unlinkSync(path.join(__dirname, 'test.yml'));

    // Create a new configuration
    expect(new Configuration(path.join(__dirname, 'test.yml'), [0,0,0], true).configuration).toBeDefined();
});

// test an invalid version
test('Configuration class (Invalid version)', () => {
    // if a test.yml file exists, delete it
    if(fs.existsSync(path.join(__dirname, 'test.yml')))
        fs.unlinkSync(path.join(__dirname, 'test.yml'));

    // Create a new configuration
    expect(() => {
        new Configuration(path.join(__dirname, 'test.yml'), [551,100000,0], true);
    }).toThrowError('Requested version does not exist');
});

// validate the properties of the configuration
test('Configuration class (Valid properties)', () => {
    // if a test.yml file exists, delete it
    if(fs.existsSync(path.join(__dirname, 'test.yml')))
        fs.unlinkSync(path.join(__dirname, 'test.yml'));

    // Create a new configuration
    const configuration = new Configuration(path.join(__dirname, 'test.yml'), [0,0,0], true);

    // Test the properties
    expect(configuration.configuration.version).toEqual([0, 0 ,0]);
    expect(configuration.configuration.a).toBe(1);
});

// Test updating the configuration
test('Configuration class (Update)', () => {
    // if a test.yml file exists, delete it
    if(fs.existsSync(path.join(__dirname, 'test.yml')))
        fs.unlinkSync(path.join(__dirname, 'test.yml'));

    // Create a new configuration
    const configuration = new Configuration(path.join(__dirname, 'test.yml'), [0,0,0], true);

    // Test the properties
    expect(configuration.configuration.version).toEqual([0, 0 ,0]);
    expect(configuration.configuration.a).toBe(1);

    // Update the configuration
    configuration.update({
        a: 5,
    });

    // Test the properties
    expect(configuration.configuration.version).toEqual([0, 0 ,0]);
    expect(configuration.configuration.a).toBe(5);
});

// Test updating the configuration with an invalid property types
test('Configuration class (Update type mismatch)', () => {
    // if a test.yml file exists, delete it
    if(fs.existsSync(path.join(__dirname, 'test.yml')))
        fs.unlinkSync(path.join(__dirname, 'test.yml'));

    // Create a new configuration
    const configuration = new Configuration(path.join(__dirname, 'test.yml'), [0,0,0], true);

    // Test the properties
    expect(configuration.configuration.version).toEqual([0, 0 ,0]);
    expect(configuration.configuration.a).toBe(1);

    // Update the configuration
    expect(() => {
        configuration.update({
            a: '5',
        });
    }).toThrowError(/.+Type mismatch for value: a.+/);
});

// Test updating the configuration with an non-existing property
test('Configuration class (Update non-existing property)', () => {
    // if a test.yml file exists, delete it
    if(fs.existsSync(path.join(__dirname, 'test.yml')))
        fs.unlinkSync(path.join(__dirname, 'test.yml'));

    // Create a new configuration
    const configuration = new Configuration(path.join(__dirname, 'test.yml'), [0,0,0], true);

    // Test the properties
    expect(configuration.configuration.version).toEqual([0, 0 ,0]);
    expect(configuration.configuration.a).toBe(1);

    // Update the configuration
    expect(() => {
        configuration.update({
            b: 5,
        });
    }).toThrowError(/.+Invalid value: b+/);
});