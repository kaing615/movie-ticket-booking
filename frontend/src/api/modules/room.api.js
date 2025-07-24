import publicClient from "../clients/public.client";

export const roomEndpoints = {
    getRoomsByTheater: (theaterId) => `/room/${theaterId}`
}

export const roomApi = {
    getRoomsByTheater: async (theaterId) => {
        const res = await publicClient.get(roomEndpoints.getRoomsByTheater(theaterId));
        return res.data.rooms || res.data;
    }
}
