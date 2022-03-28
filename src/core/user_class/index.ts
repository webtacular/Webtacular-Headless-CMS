import { ObjectId } from "mongodb";
import { ErrorHandler } from "../error_handler";
import { config as Configuration } from "../../";
import { FilterInterface } from "../graphql_handler/src/filter";
import fetch from "./src/fetch";
import { Schema, Versions, LatestVersion } from "./src/versioning";
import Authentication from "./types"

export interface UserConfig {
    _id?: ObjectId;
    version?: [number, number, number];
    username?: string;
    authentication?: {
        password?: Authentication.Password;
        totp?: Authentication.Totp;
        email?: Authentication.Email;
        phone?: Authentication.Phone;
        oauth2?: Authentication.Oauth2;
    }
}

export default class {
    _id: ObjectId = new ObjectId();

    version: [number, number, number];
    schema: Schema;
    config: UserConfig = {}

    constructor(config?: UserConfig) {
        if(config?._id)
            this._id = config._id;

        else {
            const authConfig = Configuration.configuration.authentication;

            
        }

        // Find the latest version
        this.version = LatestVersion;
        this.config = config || {};
        this.schema = Versions.get(this.version);
    }

    get(filter?: FilterInterface): Promise<Schema | void> {
        return new Promise(async(resolve, reject) => {
            // Try to fetch the user
            const rawUser = await fetch(this._id, filter).catch(reject);

            // If the user dosn't exist, return
            if(!rawUser) return;

            console.log(1);
        });
    }

}
