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
	getDailyTicketCount: (startDate, endDate) =>
		configuredPrivateClient
			.get(adminAnalyticEndpoints.getDailyTicketCount, {
				params: { start: startDate, end: endDate },
			})
			.then((res) => res.data),
	getDailyTicketRevenue: (startDate, endDate) =>
		configuredPrivateClient
			.get(adminAnalyticEndpoints.getDailyRevenue, {
				params: { start: startDate, end: endDate },
			})
			.then((res) => res.data),
	getTheaterBySystem: () =>
		configuredPrivateClient
			.get(adminAnalyticEndpoints.getTheaterBySystem)
			.then((res) => res.data),
};
