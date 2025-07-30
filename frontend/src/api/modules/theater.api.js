import publicClient from "../clients/public.client";
import { configuredPrivateClient } from "../clients/configuredClient";

export const theaterEndpoints = {
	getTheater: (systemId) =>
		systemId ? `/theater?systemId=${systemId}` : "/theater",
	getTheaterByManagerId: (managerId) => `/theater/manager/${managerId}`,
	updateTheater: (theaterId) => `/theater/${theaterId}`,
	createTheater: "/theater",
	createTheaterAndManager: "/theater/create-theater-and-manager",
	deleteTheater: (theaterId) => `/theater/${theaterId}`,
};

export const theaterApi = {
	getTheater: async (systemId) => {
		const response = await publicClient.get(
			theaterEndpoints.getTheater(systemId)
		);
		return response.data.theaters || response.data;
	},

	getTheaterByManagerId: async (managerId) => {
		const response = await publicClient.get(
			theaterEndpoints.getTheaterByManagerId(managerId)
		);
		return response.data.theater || response.data;
	},
};
