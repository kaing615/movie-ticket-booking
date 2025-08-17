// src/api/modules/show.api.js
import publicClient from "../clients/public.client";
import { configuredPrivateClient } from "../clients/configuredClient.js";

export const showEndpoints = {
  getShowsByMovie: (movieId) => `/show/movie/${movieId}`,
  getShowsByTheater: (theaterId) => `/show/theater/${theaterId}`,
  addShow: `/show`,
  updateShow: (showId) => `/show/${showId}`,
  deleteMovieFromTheater: (showId) => `/show/${showId}/movie`,
  getSeatsOfShow: (showId) => `/show/${showId}/seats`,
  holdSeats:      (showId) => `/show/${showId}/hold`,
  refreshHold:    (showId) => `/show/${showId}/hold/refresh`,
  releaseHold:    (showId) => `/show/${showId}/hold`,
};

// helper bóc data
const pick = (r) => (r && r.data && (r.data.data ?? r.data)) || r;

export const showApi = {
  getShowsByMovie: async (movieId, params) => {
    const res = await publicClient.get(showEndpoints.getShowsByMovie(movieId), { params });
    return pick(res)?.shows ?? pick(res) ?? [];
  },
  getShowsByTheater: async (theaterId, params) => {
    const res = await publicClient.get(showEndpoints.getShowsByTheater(theaterId), { params });
    return pick(res)?.shows ?? pick(res) ?? [];
  },
  addShow: async (data) => (await configuredPrivateClient.post(showEndpoints.addShow, data)).data,
  updateShow: async (showId, data) => (await configuredPrivateClient.put(showEndpoints.updateShow(showId), data)).data?.show,
  deleteMovieFromTheater: async (showId) => (await configuredPrivateClient.delete(showEndpoints.deleteMovieFromTheater(showId))).data,

  // >>> quan trọng cho SeatSelection
  getSeatsOfShow: async (showId) =>
    publicClient.get(showEndpoints.getSeatsOfShow(showId)).then(pick),

  holdSeats: async (showId, seatIds, ttlSec = 180) =>
    configuredPrivateClient.post(showEndpoints.holdSeats(showId), { seatIds, ttlSec }).then(pick),

  refreshHold: async (showId, ttlSec = 180) =>
    configuredPrivateClient.put(showEndpoints.refreshHold(showId), { ttlSec }).then(pick),

  releaseHold: async (showId, seatIds) =>
    configuredPrivateClient.delete(showEndpoints.releaseHold(showId), { data: { seatIds } }).then(pick),
};
