import publicClient from "../clients/public.client";

export const theaterEndpoints = {
    getTheater: (systemId) => systemId ? `/theater?systemId=${systemId}` : "/theater"
}

export const theaterApi = {
    getTheater: async (systemId) => {
        const response = await publicClient.get(theaterEndpoints.getTheater(systemId));
        return response.data.theaters || response.data;
    }
}