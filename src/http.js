import axios from "axios";

export const baseURL = "http://16.16.179.143:4001";

axios.defaults.withCredentials = true;

export const getConfig = () => ({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default axios;