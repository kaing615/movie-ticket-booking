import publicClient from "../clients/public.client";
import { configuredPrivateClient } from "../clients/configuredClient.js";

export const seatEndpoints = {
  getSeatsByRoom: (roomId) => `/seat/room/${roomId}`,
  getSeatById: (seatId) => `/seat/${seatId}`,
  createSeat: "/seat",
  updateSeat: (seatId) => `/seat/${seatId}`,
  deleteSeat: (seatId) => `/seat/${seatId}`,
};

export const seatApi = {
  getSeatsByRoom: async (roomId) => {
    try {
      const response = await configuredPrivateClient.get(
        seatEndpoints.getSeatsByRoom(roomId)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching seats for room:", error);
      throw error;
    }
  },

  getSeatById: async (seatId) => {
    try {
      const response = await configuredPrivateClient.get(
        seatEndpoints.getSeatById(seatId)
      );
      return response.data; 
    } catch (error) {
      console.error("Error fetching seat by ID:", error);
      throw error;
    }
  },

  createSeat: async (seatData) => {
    try {
      const response = await configuredPrivateClient.post(
        seatEndpoints.createSeat,
        seatData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating seat:", error);
      throw error;
    }
  },

  updateSeat: async (seatId, seatData) => {
    try {
      const response = await configuredPrivateClient.put(
        seatEndpoints.updateSeat(seatId),
        seatData
      );
      return response.data; 
    } catch (error) {
      console.error("Error updating seat:", error);
      throw error;
    }
  },

  deleteSeat: async (seatId) => {
    try {
      const response = await configuredPrivateClient.delete(
        seatEndpoints.deleteSeat(seatId)
      );
      return response.data; 
    } catch (error) {
      console.error("Error deleting seat:", error);
      throw error;
    }
  },
};
