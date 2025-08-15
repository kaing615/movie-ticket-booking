import publicClient from "../clients/public.client";
import { configuredPrivateClient } from "../clients/configuredClient";

export const movieEndpoints = {
	getMovies: "movies",
	getMovieById: (id) => `movies/${id}`,
	createMovie: "movies",
	updateMovie: (id) => `movies/${id}`,
	deleteMovie: (id) => `movies/${id}`,
	getMoviesOfTheater: (theaterId) => `show/theater/${theaterId}/movies`,
};

export const movieApi = {
	getMovies: (params) =>
		publicClient
			.get(movieEndpoints.getMovies, { params })
			.then((res) => res.data?.movies || []),
	getMoviesOfTheater: (theaterId) =>
		publicClient
			.get(movieEndpoints.getMoviesOfTheater(theaterId))
			.then((res) => res.data?.movies),
	getMovieById: (id) =>
		publicClient
			.get(movieEndpoints.getMovieById(id))
			.then((res) => res.data?.movie),
	createMovie: (data) =>
		configuredPrivateClient
			.post(movieEndpoints.createMovie, data)
			.then((res) => res.data),
	updateMovie: (id, data) =>
		configuredPrivateClient
			.put(movieEndpoints.updateMovie(id), data)
			.then((res) => res.data),
	deleteMovie: (id) =>
		configuredPrivateClient
			.delete(movieEndpoints.deleteMovie(id))
			.then((res) => res.data),
};
