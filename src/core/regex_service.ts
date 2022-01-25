interface regexObjects {
    [key: string]: RegExp;
}

//I ripped this straigt out of angular JS
//https://github.com/angular/angular/blob/6.1.8/packages/forms/src/validators.ts
export const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

//TODO: Better regular expressions for this
export const userRegex:regexObjects = {
    user_name: /^[a-zA-Z0-9_]{3,20}$/,
    password: /^[a-zA-Z0-9_]{3,20}$/,
    language: /^[a-zA-Z]{2}$/,
}

export const roleRegex:regexObjects = {
    role_name: /^[a-zA-Z0-9_]{3,20}$/,
    role_color: /^#[0-9a-fA-F]{6}$/,
    role_permissions: /^[a-zA-Z0-9_]{3,20}$/,
}