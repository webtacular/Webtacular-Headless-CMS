import { ObjectId } from "mongodb";

export namespace UserSchema {
    export interface User {
        _id: ObjectId;
        version: [number, number, number];
    }

    export const template: User = {
        _id: new ObjectId(),
        version: [0, 0, 0],
    }
}