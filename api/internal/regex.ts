interface regexObjects {
    [key: string]: RegExp;
}

export const userRegex:regexObjects = {
    user_name: /^[a-zA-Z0-9_]{3,20}$/,
    password: /^[a-zA-Z0-9_]{3,20}$/,
    language: /^[a-zA-Z]{2}$/,
}