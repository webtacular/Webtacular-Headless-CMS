export async function main(app:any, func:any, addon:any, types:any) {
    let msg:any = await func.contentService.create(addon, types.blog, {
        content: {
            title: 'Test'
        },
        owner: '61e9a16ac82a7ded5811144e'
    }, true);

    console.log(msg);
}