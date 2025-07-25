import { configuredPrivateClient } from "../clients/configuredClient";

export const adminAnalyticEndpoints = {
	getUserCountByRole: "analytics/user-count-by-role",
	getDailyTicketCount: "analytics/daily-ticket-number",
	getDailyRevenue: "analytics/daily-ticket-revenue",
	getTheaterBySystem: "analytics/theater-by-system",
};

export const adminAnalyticsApi = {
	getUserCountByRole: () =>
		configuredPrivateClient
			.get(adminAnalyticEndpoints.getUserCountByRole)
			.then((res) => res.data),
	getDailyTicketCount: (params) =>
		configuredPrivateClient
			.get(adminAnalyticEndpoints.getDailyTicketCount, {
				params,
			})
			.then((res) => res.data),
	getDailyTicketRevenue: (params) =>
		configuredPrivateClient
			.get(adminAnalyticEndpoints.getDailyRevenue, {
				params,
			})
			.then((res) => res.data),
	getTheaterBySystem: () =>
		configuredPrivateClient
			.get(adminAnalyticEndpoints.getTheaterBySystem)
			.then((res) => res.data),
};
