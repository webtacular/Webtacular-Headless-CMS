import { ErrorInterface } from "./interfaces";

let doLoging: boolean = true;

const log = async(obj:any | ErrorInterface) => {
    // TODO: Log the errors etc.
    if(doLoging !== true) return;
    console.log(JSON.stringify(obj));
}

export default {
    log,
    doLoging: (val:boolean) => doLoging = val
}