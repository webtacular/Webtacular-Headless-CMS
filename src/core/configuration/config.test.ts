import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import configuration from '.';

const confPath = path.join(__dirname, './test/test.config.yml');

beforeEach(() => {
    // Check if the test folder exists
    if (fs.existsSync(path.join(__dirname, './test')))
        fs.rmdirSync(path.join(__dirname, './test'), { recursive: true });

    // create test folder
    fs.mkdirSync(path.join(__dirname, './test'));

    // Create a empty config file in the test directory
    fs.writeFileSync(confPath, yaml.dump({
        version: [0, 0, 0],

        a: true,
        b: 'dsfsdf'
    }));
});

afterAll(() => {
    if(fs.existsSync(path.join(__dirname, './test')))
        // Delete the test folder
        fs.rmdirSync(path.join(__dirname, './test'), { recursive: true });
});

test('Configuration class (Valid path)', () => {
    new configuration(confPath);
});

test('Configuration class (Invalid path)', () => {
    expect(() => new configuration('f')).toThrow();
});

test('Configuration class (Properties)', () => {
    const conf = new configuration(confPath, true);

    expect(conf.config.version).toEqual([0, 0, 1]);
});

test('Configuration class (Update valid)', () => {
    const conf = new configuration(confPath, true);

    conf.update({
        version: [0, 0, 1],
        port: 1
    });

    expect(conf.config.version).toEqual([0, 0, 1]);
    expect(conf.config.port).toBe(1);
});

test('Configuration class (Update invalid)', () => {
    const conf = new configuration(confPath, true);

    expect(() => conf.update({
        version: [0, 0, 1],
        port: '1'
    })).toThrow();
});

// jest .+config.+