
![GHCMS](https://raw.githubusercontent.com/GrzegorzManiak/GHCMS/master/GHcms.png)

[![License: GPL v2](https://img.shields.io/badge/License-GPL_v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html) 
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/GrzegorzManiak/GHCMS)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/GrzegorzManiak/GHCMS)
![GitHub contributors](https://img.shields.io/github/contributors/GrzegorzManiak/GHCMS)

# This is my attempt at learning Content managment systems.

Gregs
Headless
Content
Managment
System

# Random notes

Ill start writing tests after we get stable.
Once we have a stable build we will branch from master.

[1]: Configureing MongoDB

for the token system to work, youll need to set the 'token' parameter to be a UNIQUE key
A token is composed of the _id of the token and the unhashed token seperated by a dot

e.g. _id.token -> 61e8bb1b0e441225b6b9e7cf.8468376cfc46a555063b828eb6a727efa2216f92

We validate the token by spliting it into two parts, the _id and the unhashed token, think of the _id as a email and the token as a password,
we use the _id to find the token in the db, and we compare the token to the hash thats stored in the db.

with cacheing enabled, we shave of 60-70 ms of the request time! down from 70-80ms to 15-25 ms

graphQL queries to the DB take on average 10-20ms, ofcourse, the server it self is hosted localy, but the DB is hosted on a remote server somewhere in the cloud.

for the user, you have to set the 'email' to be a UNIQUE key


## Goals

| Goal |  |
| ------------- |:-------------:|
| Oauth 2.0 | ❌  |
| Plugin system | ❌** |
| Antivirus file scan | ❌ |
| GraphQL | ✅* |
| Backup system | ❌ |
| Role based permission | ✅ |
| Document level permission | ✅ |
| Localization | ✅ |
| Importing | ❌ |
| Exporting | ❌ |
| Asset fingerprinting | ❌ |
| Static file delivery | ❌ |
| CLI | ❌ |
| User Managment | ✅* |
| Documentation | ❌ |
| Content Scheduling | ❌ |
| Img encoding | ❌ |
| Automatic setup | ❌ |

*Parital
** Parital, Techincally all services are available for plugins to use, but there isint an actual plugin mangager right now.

## Dependencies?

I want this project to be as independant as possible, I dont want to depend on any other packages.
This is a learning exercise, so excuse me if I rewrite a lot of modules.

If you see a dependency that you can write from scratch, contribute it!