# What?

This is how we will manage perms on the blog

# How?

This 'role_service' will be loosely based upon discord's role implementation.

roles will be created by the 'role_service' and will be used to determine who can do what.
with basics such as 'can_read' and 'can_write', which would be used to determine who can read and write posts or comments.

we can lock away single categories and posts with their own permissions.

# Implementation

role = {
    name
    color
    permissions
}

we will be able to create roles.
with something like createRole(role)
this would add a role to the database.

we can also delete roles. which would have 
to go trough the db and check for users with that role.
and remove them.


we can also update roles.
with something like updateRole(roleName, role)
self explanatory.


we can also get roles.
with something like getRole(roleName)
this would return the role
including id's of users with that role.


we can also get all roles.
with something like getAllRoles()
this would return all roles


we can also get all roles for a user.
with something like getRolesForUser(userId)
this would return all roles for a user.
and if it detects a role that is not in the database, 
it will remove it from the user.


we can also add a role to a user.
with something like addRoleToUser(userId, roleName)
this would add a role to a user.


we can also remove a role from a user.
with something like removeRoleFromUser(userId, roleName)
this would remove a role from a user.

each function will either return the User or it will update the Database,
depending on parameters.

for the input to the functions,
you can either pass in an Id or the UserInterface object