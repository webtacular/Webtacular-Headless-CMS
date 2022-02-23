export async function main(app:any, func:any, addon:any, types:any) {
    func.contact_service.setEmailHandler(sendMail);
}

let sendMail = async (content:any) => {
    return new Promise((resolve, reject) => {
        resolve(true)
    });
}
    