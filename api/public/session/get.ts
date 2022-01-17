import {generateToken} from "../../internal/token";

export default (req:any, res:any, resources:string[]):void => {
    generateToken('fff', res);

    res.status(200).send('GET request');
    res.end();
}