![legacy](https://github.com/GrzegorzManiak/GHCMS/tree/legacy) Brach.

![GHCMS](https://raw.githubusercontent.com/GrzegorzManiak/GHCMS/legacy/GHcms.png)

[![License: GPL v2](https://img.shields.io/badge/License-GPL_v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html) 
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/GrzegorzManiak/GHCMS)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/GrzegorzManiak/GHCMS)
![GitHub contributors](https://img.shields.io/github/contributors/GrzegorzManiak/GHCMS)

## Gregs Headless CMS

My goal with this project is to create a powerful CMS that can be used to create a websites, where most of the boring stuff is provided to you,
and the interesting stuff is done by you with a simple bit of interaction with the addon boilerplate, no more worrying about if the user has permission to do something, etc, just let the CMS handle it all, all you have to do is `user.has('permissionName')`, want to send an email to a user? `user.sendEmail('subject', 'body')` and so on.

Such as:
> GraphQL API Boilerplate
> Role Based Access Control (Discord style)
> Oauth2 Service provider
> Easy Oauth2 Authentication
> And much more...

| Goals | Progress |
| -------------- |:--------------:|
| Easy auth interface       | ❌ |
| Oauth2 Provider           | ❌ |
| Plugin system             | ❌ |
| File Uploads              | ❌ |
| Antivirus file scan       | ❌ |
| GraphQL API               | ❌ |
| Backup system             | ⏳ |
| Role based permission     | ❌ |
| Document level permission | ❌ |
| Localization              | ❌ |
| Importing Database        | ❌ |
| Exporting Database        | ❌ |
| Asset fingerprinting      | ❌ |
| Static file delivery      | ❌ |
| CLI                       | ❌ |
| User Managment            | ❌ |
| Documentation             | ❌ |
| Image encoding            | ❌ |
| Automatic setup           | ⏳ |

## Code Coverage

| Module | Coverage |
| -------------- |:--------------:|
| error_handler             | ✅ |
| general_library           | ✅ |
| configuration             | ✅ |


## Dependencies?

I want this project to be as independant as possible!
If you see a dependency that you can write from scratch, contribute it!
