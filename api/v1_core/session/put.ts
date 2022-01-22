export default (req:any, res:any,  resources:string[]):void => {
    res.status(200).send('PUT request');
    res.end();
}