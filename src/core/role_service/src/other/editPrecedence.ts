import { toNumber } from "lodash";
import { ObjectId } from "mongodb";
import { globalRoleObject } from "../../../global_service";
import { ErrorInterface, GlobalRoleObject, RoleInterface } from "../../../interfaces";
import { locals, returnLocal } from "../../../response_handler";

/**
 * Changes the precedence of a specific role
 * 
 * @param object {
 *    _id: ObjectId, // The _id of the role to edit
 *    precedence: number // The new precedence
 * }
 * 
 * @returns Promise<ErrorInterface | RoleInterface>
 */
export default async (role: {
    precedence: number, 
    _id: ObjectId
}, gro?:GlobalRoleObject): Promise<ErrorInterface | { [key: string | number]: ObjectId }> => {
    return new Promise(async (resolve, reject) => {
        // Check if the precedence is valid, no floats
        if (role.precedence < 1 || role.precedence % 1 !== 0) return reject({
            code: 1,
            local_key: locals.KEYS.INVALID_ROLE_PRECEDENCE, 
            message: returnLocal(locals.KEYS.INVALID_ROLE_PRECEDENCE),
        } as ErrorInterface);

        // Get the global role object if it is not passed in
        if(!gro) gro = (await globalRoleObject.get({
            precedence: 1,
            roles: 1,
        }).catch(reject)) as GlobalRoleObject;
        

        // Get the roles from the global role object
        let roles = gro.roles as Array<RoleInterface>,
            found = false;

        // Check if the role we are about set the precedence for exists
        for(let role_index in roles) {

            // Check if the role has a core switch and if it is set to true
            if(roles[role_index]?.core === true && roles[role_index]?._id?.toString() === role?._id?.toString()) 
            return reject({
                code: 1,        
                local_key: locals.KEYS.CANNOT_EDIT_CORE_ROLE,
                message: returnLocal(locals.KEYS.CANNOT_EDIT_CORE_ROLE),
            } as ErrorInterface);

            // Check if the role exists
            if(roles[role_index]?._id?.toString() === role._id?.toString()) {
                found = true;
                break;
            }
        }

        // If the role we are trying to edit does not exist, return an error    
        if(found !== true) return reject({
            code: 1,
            local_key: locals.KEYS.NOT_FOUND,
            message: returnLocal(locals.KEYS.NOT_FOUND),   
            where: 'role_service.other.editPrecedence()',
        } as ErrorInterface);


        // make sure that the client cant just set an abnormaly high precedence
        // like 3452345234523452345 or something. they will only ever be able to
        // set a precedence that is one higher than the current amount of roles
        if(role.precedence > roles.length) role.precedence = roles.length + 1;

        // Get the core precedence's.
        let corePrecedence:{ [key: string | number]: ObjectId } = {};
        for(let i in gro.precedence) {
            if(toNumber(i) < 1) corePrecedence[i] = gro.precedence[i];
        }

        // Let a temp variable to hold the new precedence's
        // and the addition tally
        let newPrecedence:{ [key: string | number]: ObjectId } = {},
            addition = 1;

        for(let i = 1; i < roles.length + 1; i++) {
            let currentRole = gro.precedence[i];

            // Is this a role that isint going to be affected by the edit? let it be
            if(i < role.precedence && currentRole?.toString() !== role._id.toString())
                newPrecedence[i] = currentRole;

            // Check if I is equall to the precedence we are trying to set
            if(i === role.precedence) {

                // Are we taking the place of another role?
                if(currentRole?.toString() !== role._id.toString()) {
                    // Allow the role that is currently at the precedence to stay
                    newPrecedence[i] = currentRole;

                    // Add the role that is being moved to the new precedence + 1
                    newPrecedence[i + addition] = role._id

                    // Increment the addition, so that the next role will be added after this one
                    addition++;
                } 
                
                // If not, Add the role to the precedence
                else newPrecedence[i] = role._id;
            }

            // Offset the precedence by x for the proceeding roles
            if(i > role.precedence && currentRole)
                newPrecedence[i + addition] = currentRole;
        }

        // Re-arrange the precedence and merge it with the core precedence
        let count = 1;
        Object.keys(newPrecedence).map((key) => {
            if(newPrecedence[key])
                corePrecedence[count++] = newPrecedence[key]
        });

        // Replace the old precedence with the new precedence
        gro.precedence = corePrecedence;

        // Update the global role object
        await globalRoleObject.set(gro).catch(reject).then(() => resolve(corePrecedence));
    });
}