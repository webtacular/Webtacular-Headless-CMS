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
| `88445619-0969-4a40-94e3-2d07bf85c9a7` | Non-Fatal | This error occurs when you try initialize the client more than once |