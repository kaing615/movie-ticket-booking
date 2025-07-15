import publicClient from "../clients/public.client";

export const showEndpoints = {
    getShowsByMovie: (movieId) => `/show/movie/${movieId}`,
    getShowsByTheater: (theaterId) => `/show/theater/${theaterId}`,
}

export const showApi = {
    getShowsByMovie: async (movieId) => {
        const response = await publicClient.get(showEndpoints.getShowsByMovie(movieId));
        return response.data.shows || response.data;
    },
    getShowsByTheater: async (theaterId) => {
        const response = await publicClient.get(showEndpoints.getShowsByTheater(theaterId));
        return response.data.shows || response.data;
    },
}