<h1 align="center">
   General library
</h1>

## Description

This module provides general functions and classes such as,

> GUID (Version 4)

## GUID Usage
```typescript

import { GUID } from "general_library";

// Generate a GUID
const guid = new GUID();

// Convert a string to a GUID
// If the string is not a GUID, the class will throw an error
const guid = new GUID('0D9E8E9F-E9E9-4D9E-9E9E-9E9E9E9E9E9E');

// Convert a GUID to a string
guid.toString();

// Validate a GUID
guid.isValid('0D9E8E9F-E9E9-4D9E-9E9E-9E9E9E9E9E9E');
guid.isValid(guidObject);

// Compare two GUIDs
guid.equals('0D9E8E9F-E9E9-4D9E-9E9E-9E9E9E9E9E9E');
guid.equals(guidObject);
```