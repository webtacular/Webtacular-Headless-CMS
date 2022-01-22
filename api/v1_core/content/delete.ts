import { getIP } from "../../internal/ip_service";

export default async (req:any, res:any, resources:string[]):Promise<void> => {
    
    res.status(200).send(getIP(req));
    res.end();
}
