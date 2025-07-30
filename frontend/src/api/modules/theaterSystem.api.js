import publicClient from "../clients/public.client";
import { configuredPrivateClient } from "../clients/configuredClient";

export const theaterSystemEndpoints = {
	getAllTheaterSystems: "/theater-system",
	getTheaterSystemById: (systemId) => `/theater-system/${systemId}`,
};

export const theaterSystemApi = {
	getAllTheaterSystems: async () => {
		const res = await publicClient.get(
			theaterSystemEndpoints.getAllTheaterSystems
		);
		return res.data;
	},
	getTheaterSystemById: async (systemId) => {
		const res = await publicClient.get(
			theaterSystemEndpoints.getTheaterSystemById(systemId)
		);
		return res.data;
	},
};
