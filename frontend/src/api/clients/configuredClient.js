// src/api/configuredClient.js
import createPrivateClient from "./private.client.js";
import store from "../../redux/store.js"; // Import your Redux store

// Initialize the private client once with dispatch from the store
export const configuredPrivateClient = createPrivateClient(store.dispatch);
