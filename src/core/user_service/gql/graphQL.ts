import { user as user_manager } from '../';
import { checkForToken } from '../../token_service';
import { ObjectId } from 'mongodb';
import { graphql } from "../../../api";

let get_user = async (args:any, req:any, context:any) => {
    // Check if the request is authenticated
    await checkForToken(req, true);

    // Test the ID
    if(ObjectId.isValid(args?.id) === false)
        return;

    // Get the ID and the user data
    let id:ObjectId = new ObjectId(args?.id),
        filter = graphql.filter(context).user,
        user_data:any = (await user_manager.get(id, filter))[0];

    // if the user is an admin, return all the data
    if((req as any)?.auth?.admin === true)
        return user_data;

    // This is the baic data that any one can see
    let base_response:any = {
        _id: user_data?._id?.toString(),
        user_name: user_data?.user_name,
        language: user_data?.language,
        profile_picture: user_data?.profile_picture,
        blog_info: user_data?.blog_info,
        permissions: user_data?.permissions,
    }

    // if the user is checking their own data, return more data
    if(user_data?._id?.toString() === (req as any)?.auth?.user_id?.toString()) {
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

export const rootResolvers = {
    user: get_user
}
