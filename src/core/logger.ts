import { ErrorInterface } from "./interfaces";

const log = async(obj:any | ErrorInterface) => {
    // TODO: Log the errors etc.

    console.log(JSON.stringify(obj));
}

export default {
    log
}