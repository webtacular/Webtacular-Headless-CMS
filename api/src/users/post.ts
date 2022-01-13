export default (req:any, res:any, resources:string[]):void => {
    res.status(200).send(JSON.stringify(resources));
    console.log(resources);
    res.end();
}