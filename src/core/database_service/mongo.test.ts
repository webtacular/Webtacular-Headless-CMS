import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { MongoClient } from 'mongodb';
import MongoService from './';

const testConfig: {
    db: string
} = yaml.load(fs.readFileSync(path.resolve(__dirname, './test.yml'), 'utf8')) as { db: string };

// Test connection to the database
test('Testing connection string', async () => {
    const client: MongoClient = new MongoClient(testConfig.db);

    await client.connect();
});

// Test invalid connection string
test('Testing invalid connection string (Invalid format)', async () => {
    const client = new MongoService('invalid');

    expect(() => client.init()).rejects;
});

// Test invalid connection string in the correct format
test('Testing invalid connection string (Valid format)', async () => {
    const client = new MongoService('mongodb://invalid');

    expect(() => client.init()).rejects;
});

// Try getting client before initializing
test('Getting client before initializing', async () => {
    const service: MongoService = new MongoService(testConfig.db);

    expect(() => service.getClient()).toThrowError();
});

// Try getting collection before initializing
test('Getting collection before initializing', async () => {
    const service: MongoService = new MongoService(testConfig.db);

    expect(() => service.getCollection('test')).toThrowError();
});

// Initialize service
test('Initializing service', async () => {
    const service: MongoService = new MongoService(testConfig.db);

    expect(service.init()).resolves.toBeUndefined();
});

// Try getting client after initializing
test('Getting client after initializing', async () => {
    const service: MongoService = new MongoService(testConfig.db);

    await service.init();

    expect(service.getClient()).toBeDefined();
});

// Try getting collection after initializing
test('Getting collection after initializing', async () => {
    const service: MongoService = new MongoService(testConfig.db);

    await service.init();

    expect(service.getCollection('test')).toBeDefined();
});

// Try initializing service twice
test('Initializing service twice', async () => {
    const service: MongoService = new MongoService(testConfig.db);

    await service.init();

    expect(() => service.init()).rejects;
});

// jest .+mongo.+