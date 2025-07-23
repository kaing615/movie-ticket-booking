import publicClient from "../clients/public.client";
import createPrivateClient from "../clients/private.client";
export const showEndpoints = {
    getShowsByMovie: (movieId) => `/show/movie/${movieId}`,
    getShowsByTheater: (theaterId) => `/show/theater/${theaterId}`,
    addShow: `/show`,
    updateShow: (showId) => `/show/${showId}`,
    deleteShow: (showId) => `/show/${showId}`
}

export const showApi = {
    getShowsByMovie: async (id) => {
        const response = await publicClient.get(showEndpoints.getShowsByMovie(id));
        return response.data.shows || response.data;
    },
    getShowsByTheater: async (theaterId) => {
        const response = await publicClient.get(showEndpoints.getShowsByTheater(theaterId));
        return response.data.shows || response.data;
    },
    addShow: async (data) => {
        const response = await createPrivateClient.post(showEndpoints.addShow, data);
        return response.data;
    },
    updateShow: async (showId, data) => {
        const response = await createPrivateClient.put(showEndpoints.updateShow(showId), data);
        return response.data.show;
    },
    deleteShow: async (showId) => {
        const response = await createPrivateClient.delete(showEndpoints.deleteShow(showId));
        return response.data;
    }
}