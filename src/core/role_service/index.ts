// Main goals,
// - 1. Allow for multiple roles to be assigned to a user
// - 2. Allow for the removal of roles from a user
// - 3. THe user object stores nothing about the roles, info about what roles the user has is stored in the user_roles collection

import { ObjectId } from "mongodb";

// - 4. Roles are stored in a list, 0 is the default role, the lower the number, the lower the 'rank' aka precedence
// - 5. Precedence will be stored in the global role object, { [role_precedence:number]: role_id }
// - 6. The role object will have a list of permissions, { [permission_id:string]: true/false/undefined } 
//      
//      - undefined means the permission is not set, 
//      - false means the permission is denied,
//      - true means the permission is granted,
//
//      P5 { role1: true, role2: false, role3: undefined }
//      P4 { role1: false, role2: true, role3: true }    +
//      --------------------------------------------------
//      RE { role1: true, role2: false, role3: true }
//      
//      Our role system is bassed on inheritance, so if a role with a higher precedence has a permission, it will override the lower precedence role.
//      Think of this as OR bitmasking, where the higher precedence role has the ability to override the lower precedence role.
//
//
//      This role object will be structured like so:
//      {
//          _id: ObjectId,
//          role_id: string,
//          permissions: [{
//            permission_id: ObjectId,
//            value: true/false/undefined
//          }],
//          sandwhich: string
//          created_at: Date,
//          updated_at: Date,
//      }
//
// - 7. the Global role object will be structured like so:
//      {
//          _id: ObjectId,  
//          core_permissions: [{
//              permission_id: ObjectId,
//              name: string,
//          }],
//          addon_permissions: [{
//              permission_id: ObjectId,
//              name: string,
//              addon_id: ObjectId,
//          }],
//          precedence: {
//              [role_precedence:number]: ObjectId,
//          }
//      }
//      
//      This will be stored in the configuraiton collection.
//
// - 8. Content can have specific permissions,
//      Lets say a user with the role 'user' has the permission 'user.create'.
//      Normally, they would be able to create something, lets say, create a comment
//
//      But now if the post hes tring to comment under has role.create set to false, then they will not be able to create a comment.
//      
//      The contents permissions will be treated like an extra role of the user trying to interact with the content.
//      so the steps of the permission system will be:
//          1. Grab the content permissions
//          2. Grab the user's roles
//
//          3. Merge the content permissions (user) role with the users (user) role
//             contnet permissions in this case will be of higher precedence
//             Content Permissions for the role 'user' will override the users role
//
//          4. continue to merge the rest of the user's roles. 

export default {
    create: async(object: { name: string, permissions: Array<{ value: number, _id:ObjectId }>, precedence: number }) => require('./src/create').default(object),
}