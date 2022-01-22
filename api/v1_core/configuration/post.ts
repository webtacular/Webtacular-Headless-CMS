export default async (req:any, res:any,  resources:string[]):Promise<void> => {
    res.status(200).send('PUT request');
    res.end();
}