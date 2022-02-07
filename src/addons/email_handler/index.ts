export async function main(app:any, func:any, addon:any, types:any) {
    func.userService.setEmailHandler(sendMail(func))
}

let sendMail = async (func:any) => {
    return func = async (content:any, email:string, returnError?:boolean) => {
        return new Promise((resolve, reject) => {
            console.log(1)
        });
    }
}
    