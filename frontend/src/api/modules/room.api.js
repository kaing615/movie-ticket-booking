import publicClient from "../clients/public.client";

export const roomEndpoints = {
    getRoomsByTheater: (theaterId) => `/room/${theaterId}`,
    createRoom: "/room/create",
    getSeatsByRoom: (roomId) => `/room/${roomId}/seats`,
    updateSeatsByRoom: (roomId) => `/room/${roomId}/seats/update`,
};

export const roomApi = {
    getRoomsByTheater: async (theaterId) => {
        const res = await publicClient.get(roomEndpoints.getRoomsByTheater(theaterId));
        return res.data.rooms || res.data;
    },
    createRoom: async (data) => {
        const res = await publicClient.post(roomEndpoints.createRoom, data);
        return res.data;
    },
    getSeatsByRoom: async (roomId) => {
        const res = await publicClient.get(roomEndpoints.getSeatsByRoom(roomId));
        return res.data.seats || res.data;
    },
    updateSeatsByRoom: async (roomId, seatsData) => {
        const res = await publicClient.put(roomEndpoints.updateSeatsByRoom(roomId), seatsData);
        return res.data;
    }
};
