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
    getMovies: (params) => publicClient.get(movieEndpoints.getMovies, { params }).then(res => res.data),
    getMovieById: (id) => publicClient.get(movieEndpoints.getMovieById(id)).then(res => res.data),
    createMovie: (data) => createPrivateClient.post(movieEndpoints.createMovie, data).then(res => res.data),
    updateMovie: (id, data) => createPrivateClient.put(movieEndpoints.updateMovie(id), data).then(res => res.data),
    deleteMovie: (id) => createPrivateClient.delete(movieEndpoints.deleteMovie(id)).then(res => res.data),
};