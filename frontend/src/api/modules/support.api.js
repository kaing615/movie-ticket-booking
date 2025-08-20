import { configuredPrivateClient } from "../clients/configuredClient";

export const supportEndpoints = {
	getSupports: "/support",
	getSupport: "/support/:id",
	createSupport: "/support",
	updateSupport: "/support/:id",
	deleteSupport: "/support/:id",
};

export const supportApi = {
	getSupports: async () => {
		const response = await configuredPrivateClient.get(
			supportEndpoints.getSupports
		);
		return response.data?.tickets || [];
	},

	getSupport: async (id) => {
		const response = await configuredPrivateClient.get(
			supportEndpoints.getSupport(id)
		);
		return response.data?.tickets;
	},

	createSupport: async (data) => {
		const response = await configuredPrivateClient.post(
			supportEndpoints.createSupport,
			data
		);
		return response.data;
	},
	updateSupport: async (id, data) => {
		const response = await configuredPrivateClient.put(
			supportEndpoints.updateSupport(id),
			data
		);
		return response.data;
	},
	deleteSupport: async (id) => {
		const response = await configuredPrivateClient.delete(
			supportEndpoints.deleteSupport(id)
		);
		return response.data;
	},
};
