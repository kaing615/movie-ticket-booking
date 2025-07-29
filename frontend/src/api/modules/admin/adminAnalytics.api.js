import { configuredPrivateClient } from "../../clients/configuredClient";

const adminAnalyticEndpoints = {
	getUserCountByRole: "/admin/analytics/user-count-by-role",
	getDailyTicketCount: "/admin/analytics/daily-ticket-number",
	getDailyRevenue: "/admin/analytics/daily-ticket-revenue",
	getTheaterBySystem: "/admin/analytics/theater-by-system",
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
