import { configuredPrivateClient } from "../clients/configuredClient";

const userEndpoints = {
    updateProfile:  "user/update-account",
    deleteAccount: "user/delete-account",
};

export const userApi = {
    updateProfile: async (data) => {
        const response = await configuredPrivateClient.put(userEndpoints.updateProfile, data);
        return response.data.userData || response.data;
    },
    deleteProfile: async (data) =>{
        const response = configuredPrivateClient.delete(userEndpoints.deleteAccount, {data});
        return response.data ;
    },
};