export namespace Authentication {
    type Base = {
        threatLevel: number;
        reqiured: boolean;
    }

    export type Password = {
        password: string;
    };
    
    export type Email = {
        email: string;
        provider: string;
    }
    
    export type Phone = {
        countryCode: string;
        phoneNumber: string;
    }
    
    export type Totp = {
        secret: string;
    }
    
    export type Oauth2 = {
        oauthID: string;
        provider: string;
    }
}

export default Authentication;