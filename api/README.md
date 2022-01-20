This is a temp file, just so I can note some things down

[1]: Configureing MongoDB

for the token system to work, youll need to set the 'token' parameter to be a UNIQUE key
A token is composed of the _id of the token and the unhashed token seperated by a dot

e.g. _id.token -> 61e8bb1b0e441225b6b9e7cf.8468376cfc46a555063b828eb6a727efa2216f92

We validate the token by spliting it into two parts, the _id and the unhashed token, think of the _id as a email and the token as a password,
we use the _id to find the token in the db, and we compare the token to the hash thats stored in the db.

with cacheing enabled, we shave of 60-70 ms of the request time! down from 70-80ms to 15-25 ms

TODO: Look into a Cpp + node Bcrypt libary 

for the user, you have to set the 'email' to be a UNIQUE key