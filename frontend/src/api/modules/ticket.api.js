// src/api/modules/ticket.api.js
import createPrivateClient from "../clients/private.client";

const privateClient = createPrivateClient();

export const ticketApi = {
  getTicketById: async (id) => {
    const { data } = await privateClient.get(`/ticket/${id}`);
    return data;
  },
  getUserTickets: async (status) => {
    const params = status ? { status } : {};
    const { data } = await privateClient.get("/ticket/me", { params });
    return data;
  },
  markTicketAsUsed: async (id) => {
    const { data } = await privateClient.put(`/ticket/${id}/use`);
    return data;
  },
  cancelTicket: async (id) => {
    const { data } = await privateClient.put(`/ticket/${id}/cancel`);
    return data;
  },
  refundTicket: async (id) => {
    const { data } = await privateClient.put(`/ticket/${id}/refund`);
    return data;
  },
};
