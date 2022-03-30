import { UserSchema as Schema000 } from '../def/000';
import { UserSchema as Schema001 } from '../def/001';

//                              UPDATE ME TOO   //
//                              VVV ------ VVV  //
export interface Schema extends Schema001.ConfigurationInterface {}

// MAP of the schema versions
export const Versions = new Map<[number, number, number], any>([]);

Versions.set([0, 0, 0], Schema000);
Versions.set([0, 0, 1], Schema001);

// ----------[ Everything below this line is not to be modified ]----------//

export let LatestVersion: [number, number, number] = [0, 0, 0];

// Find the latest version
for(let version of Versions.keys()) {
    if(version[0] >= LatestVersion[0] && 
        version[1] >= LatestVersion[1] && 
        version[2] >= LatestVersion[2]) 
        LatestVersion = version;
}