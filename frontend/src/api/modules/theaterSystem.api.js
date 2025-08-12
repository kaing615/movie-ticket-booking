import publicClient from "../clients/public.client";
import { configuredPrivateClient } from "../clients/configuredClient";

export const theaterSystemEndpoints = {
	getAllTheaterSystems: "/theater-system",
	getTheaterSystemById: (systemId) => `/theater-system/${systemId}`,
	createTheaterSystem: "/theater-system",
	updateTheaterSystem: (systemId) => `/theater-system/${systemId}`,
	deleteTheaterSystem: (systemId) => `/theater-system/${systemId}`,
	addTheaterToSystem: "/theater-system/add-theater", // Endpoint for assigning theater to system
};

export const theaterSystemApi = {
	getAllTheaterSystems: async () => {
		const res = await publicClient.get(
			theaterSystemEndpoints.getAllTheaterSystems
		);
		return res.data || [];
	},
	getTheaterSystemById: async (systemId) => {
		const res = await publicClient.get(
			theaterSystemEndpoints.getTheaterSystemById(systemId)
		);
		return res.data;
	},
	createTheaterSystem: async (data) => {
		console.log(data);
		const res = await configuredPrivateClient.post(
			theaterSystemEndpoints.createTheaterSystem,
			data
		);
		return res.data;
	},
	updateTheaterSystem: async (systemId, data) => {
		console.log("System ID:", systemId);
		console.log("Data:", data);
		console.log(theaterSystemEndpoints.updateTheaterSystem(systemId));
		const res = await configuredPrivateClient.put(
			theaterSystemEndpoints.updateTheaterSystem(systemId),
			data
		);
		return res.data;
	},
	deleteTheaterSystem: async (systemId) => {
		const res = await configuredPrivateClient.delete(
			theaterSystemEndpoints.deleteTheaterSystem(systemId)
		);
		return res.data;
	},
	addTheaterToSystem: async (data) => {
		// This is for explicitly assigning a theater to a system
		const res = await configuredPrivateClient.post(
			theaterSystemEndpoints.addTheaterToSystem,
			data
		);
		return res.data;
	},
};
