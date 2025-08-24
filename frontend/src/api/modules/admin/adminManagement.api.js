import { configuredPrivateClient } from "../../clients/configuredClient";

const root = "/admin/management";

export const adminManagementEndpoints = {
  getManagers: `${root}/users/managers`,
  getCustomers: `${root}/users/customers`,
  createCustomer: `${root}/users/customers`,
  updateCustomer: (id) => `${root}/users/customers/${id}`,
  deleteCustomer: (id) => `${root}/users/customers/${id}`,
  updateManager: (id) => `${root}/users/managers/${id}`,
  deleteManager: (id) => `${root}/users/managers/${id}`,
};

export const adminManagementApi = {
  getManagers: async () => {
    const res = await configuredPrivateClient.get(
      adminManagementEndpoints.getManagers
    );
    return res.data || [];
  },
  updateManager: async (id, data) => {
    const res = await configuredPrivateClient.put(
      adminManagementEndpoints.updateManager(id),
      data
    );
    return res.data;
  },
  deleteManager: async (id) => {
    const res = await configuredPrivateClient.delete(
      adminManagementEndpoints.deleteManager(id)
    );
    return res.data;
  },

  getCustomers: async () => {
    const res = await configuredPrivateClient.get(
      adminManagementEndpoints.getCustomers
    );
    return res.data || [];
  },
  createCustomer: async (data) => {
    const res = await configuredPrivateClient.post(
      adminManagementEndpoints.createCustomer,
      data
    );
    return res.data;
  },
  updateCustomer: async (id, data) => {
    const res = await configuredPrivateClient.put(
      adminManagementEndpoints.updateCustomer(id),
      data
    );
    return res.data;
  },
  deleteCustomer: async (id) => {
    const res = await configuredPrivateClient.delete(
      adminManagementEndpoints.deleteCustomer(id)
    );
    return res.data;
  },
};
