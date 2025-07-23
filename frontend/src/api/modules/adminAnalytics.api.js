import createPrivateClient from "../clients/private.client";

export const adminAnalyticEndpoints = {
	getUserCountByRole: "analytics/user-count-by-role",
	getDailyTicketCount: "analytics/daily-ticket-number",
	getDailyRevenue: "analytics/daily-ticket-revenue",
	getTheaterBySystem: "analytics/theater-by-system",
};

export const movieApi = {
	getUserCountByRole: () =>
		createPrivateClient
			.get(adminAnalyticEndpoints.getUserCountByRole)
			.then((res) => res.data),
	getDailyTicketCount: () =>
		createPrivateClient
			.get(adminAnalyticEndpoints.getDailyTicketCount)
			.then((res) => res.data),
	deleteMovie: (id) =>
		createPrivateClient
			.delete(movieEndpoints.deleteMovie(id))
			.then((res) => res.data),
};
