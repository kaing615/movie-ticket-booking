import publicClient from "../clients/public.client";
import { configuredPrivateClient } from "../clients/configuredClient.js";
import { checkWatched } from "../../../../backend/src/controllers/review.controller.js";

export const reviewEndpoints = {
    getReviews: (movieId) => `/review/${movieId}`,
    createReview: (movieId) => `/review/create-review/${movieId}`,
    updateReview: (reviewId) => `/review/update-review/${reviewId}`,
    deleteReview: (reviewId) => `/review/${reviewId}`,
    checkWatched: (movieId) => `/review/${movieId}/check-watched`,
};

export const reviewApi = {
    getReviews: async (movieId) => {
        const response = await publicClient.get(reviewEndpoints.getReviews(movieId));
        return response.data.reviews || response.data;
    },
    checkWatched: async (movieId) => {
        const response = await configuredPrivateClient.get(reviewEndpoints.checkWatched(movieId));
        return response.data.hasWatched || false;
    },
    createReview: async (movieId, data) => {
        // data: { rating, comment }
        const response = await configuredPrivateClient.post(
            reviewEndpoints.createReview(movieId),
            data
        );
        return response.data.review || response.data;
    },
    updateReview: async (reviewId, data) => {
        // data: { rating, comment }
        const response = await configuredPrivateClient.put(
            reviewEndpoints.updateReview(reviewId),
            data
        );
        return response.data.review || response.data;
    },
    deleteReview: async (reviewId) => {
        const response = await configuredPrivateClient.delete(
            reviewEndpoints.deleteReview(reviewId)
        );
        return response.data;
    },
};