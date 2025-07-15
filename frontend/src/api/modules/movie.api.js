import publicClient from "../clients/public.client";
import createPrivateClient from "../clients/private.client";

export const movieEndpoints = {
    getMovies: "movies",
    getMovieById: (id) => `movies/${id}`,
    createMovie: "movies",
    updateMovie: (id) => `movies/${id}`,
    deleteMovie: (id) => `movies/${id}`,
};

export const movieApi = {
    getMovies: (params) => publicClient.get(movieEndpoints.getMovies, { params }),
    getMovieById: (id) => publicClient.get(movieEndpoints.getMovieById(id)),
    createMovie: (data) => createPrivateClient.post(movieEndpoints.createMovie, data),
    updateMovie: (id, data) => createPrivateClient.put(movieEndpoints.updateMovie(id), data),
    deleteMovie: (id) => createPrivateClient.delete(movieEndpoints.deleteMovie(id)),
};