import publicClient from "../clients/public.client";
import { configuredPrivateClient } from "../clients/configuredClient.js";
export const showEndpoints = {
    getShowsByMovie: (movieId) => `/show/movie/${movieId}`,
    getShowsByTheater: (theaterId) => `/show/theater/${theaterId}`,
    addShow: `/show`,
    updateShow: (showId) => `/show/${showId}`,
    deleteMovieFromTheater: (showId) => `/show/${showId}/movie`
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
        const response = await configuredPrivateClient.post(showEndpoints.addShow, data);
        return response.data;
    },
    updateShow: async (showId, data) => {
        const response = await configuredPrivateClient.put(showEndpoints.updateShow(showId), data);
        return response.data.show;
    },
    deleteMovieFromTheater: async (showId) => {
        const response = await configuredPrivateClient.delete(showEndpoints.deleteMovieFromTheater(showId));
        return response.data;
    }
}