import { getIP } from "../../internal/ip_address";

export default (req:any, res:any, resources:string[]):void => {
    getIP(req)
    res.status(200).send('DELETE request');
    res.end();
}
