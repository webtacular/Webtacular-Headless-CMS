import { user as user_manager } from '../';
import { checkForToken } from '../../token_service';
import { UserInterface } from '../../interfaces';
import { ObjectId } from 'mongodb';

let user = async (args:any, req:any) => {
    // Check if the request is authenticated
    await checkForToken(req, true);

    // Test the ID
    if(ObjectId.isValid(args?.id) === false)
        return; //TODO: htf do you manage errors in gql?

    // Get the ID and the user data
    let id:ObjectId = new ObjectId(args?.id),
        user_data = await user_manager.get(id);

    // If the user does not exist, return nothing
    if(user_data === false) return;

    // make sure the data is in the correct type
    else user_data = user_data as UserInterface;

    // if the user is an admin, return all the data
    if(req.auth.admin === true)
        return user_data;

    // This is the baic data that any one can see
    let base_response:any = {
        _id: user_data?._id?.toString(),
        user_name: user_data?.user_name,
        language: user_data?.language,
        profile_picture: user_data?.profile_picture,
        blog_info: user_data?.blog_info,
    }

    // if the user is checking their own data, return more data
    if(user_data?._id?.toString() === req?.auth?.user_id?.toString()) {
        Object.assign(base_response, {
            email: user_data?.email,
            security_info: user_data?.security_info,
            previous_info: {
                user_name: user_data?.previous_info?.user_name,
                email: user_data?.previous_info?.email,
            }
        });
    }

    // return the data
    return base_response;
}

export const rootFuncs = {
    user: (args:any, req:any) => user(args, req)
}