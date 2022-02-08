/*
    LOGIN > | 
            | OAUTH2 > | 
            |          | old user > |
            |          |            | Find the user and log them in
            |          |
            |          | New user > |
            |                       |  email already exists > |
            |                       |                         | force them to login with their password to link their account
            |                       |
            |                       |  new email -----------> |
            |                                                 | Create the account with the oauth2 info
            |                                                 | make them create a password else delete the account
            |
            |
            | EMAIL/PASS/USERNAME > |
            |                       | Find user, compare password hashes, return user
            |
            |
            | SMS > |
                    | Find user, compare password hashes, return user
*/