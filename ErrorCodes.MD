<h1 align="center">
    Error Codes
</h1>

## Description

These are the UUID error codes and their descriptions.

| UUID | Fatality | Description |
| -------------- |:--------------:|:--------------:|
| `2bd03577-62bc-46b1-b3e7-492590e9842b` | Fatal | This error occures when an invalid MongoDB connection string is provided OR it cannot find the Mongo Database |
| `9de6a6e2-2d07-4cb0-a1d9-2001c60a4657` | Fatal | This occurs when you try 'getClient' without first initializing the client or any other functions that rely on the client |
| `14e05e6d-0dc7-459e-94e0-2b6b9f5a22a7` | Fatal | This error occurs when you pass an invalid connection string, Valid => ("mongodb://" or "mongodb+srv://") |
| `ecd5848a-dd6f-4711-8b41-57b2f1ed86b9` | Fatal | This error occurs when an unknown database error occurs |
| `88445619-0969-4a40-94e3-2d07bf85c9a7` | Non-Fatal | This error occurs when you try initialize the client more than once |
| `295cd853-d7fd-4e4b-bb88-f46cb576fbdc` | Non-Fatal | This error occurs when a module trys to access the database but for some reason, it fails |
| `e0d7d2e6-c8a0-4c1c-b09d-f8e8f9b9e3f7` | Non-Fatal | This error occurs when you try to get a user that dosent exist |
| `27fa762a-81be-4021-ae17-7795950b3fbd` | Fatal | This error occurs when you try to validate a configuration file with a version that dose not exist |
| `b6aa4dec-f0da-45e9-9e62-cebefdd495ef` | Fatal | This error occurs when you try to validate a configuration file that dosent exist |
| `0c88c791-f409-4d02-b161-f37522abd478` | Fatal | This error occurs when the a configuration file is invalid |