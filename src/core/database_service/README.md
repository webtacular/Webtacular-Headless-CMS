<h1 align="center">
    MongoDB Service
</h1>

## Description

This module provides a simple way to connect and interface with MongoDB.

## Usage

```typescript
import MongoService from './';

// Optional:
const options: MongoClientOptions = {} // See https://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html

// Instantiate the MongoService
const client: MongoService = new MongoService('mongodb://localhost:27017', options);

// Initialize the MongoService
await client.init();

// Gets the collection from the database
const someCollection: Collection<Document> = client.getCollection('dbName', 'collectionName');

// Gets the MongoDB Client instance
const mongoClient: MongoClient = client.getClient();

```
