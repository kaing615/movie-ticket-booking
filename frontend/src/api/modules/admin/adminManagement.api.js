import { configuredPrivateClient } from "../../clients/configuredClient";

const root = "/admin/management";

export const adminManagementEndpoints = {
	getManagers: `${root}/users/managers`,
};

export const adminManagementApi = {
	getManagers: async () => {
		const res = await configuredPrivateClient.get(
			adminManagementEndpoints.getManagers
		);
		return res.data || [];
	},
};
