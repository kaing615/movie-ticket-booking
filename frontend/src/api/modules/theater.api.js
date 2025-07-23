import publicClient from "../clients/public.client";
import createPrivateClient from "../clients/private.client";

export const theaterEndpoints = {
    getTheater: (systemId) => systemId ? `/theater?systemId=${systemId}` : "/theater",
    getTheaterByManagerId: (managerId) => `/theater/manager/${managerId}`,
}

export const theaterApi = {
    getTheater: async (systemId) => {
        const response = await publicClient.get(theaterEndpoints.getTheater(systemId));
        return response.data.theaters || response.data;
    },
    
    getTheaterByManagerId: async (managerId) => {
        try {
            console.log('Calling getTheaterByManagerId with:', managerId);
            const token = localStorage.getItem('actkn');
            console.log('Token present:', !!token);
            
            const response = await createPrivateClient.get(
                theaterEndpoints.getTheaterByManagerId(managerId)
            );
            console.log('API Response:', response);
            
            return response.data.theater || response.data;
        } catch (error) {
            console.error('API Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    }
}
