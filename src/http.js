import axios from "axios";

const HOSTED_API = "http://16.16.179.143:4001";

// Production: hits hosted backend directly
// Local dev: empty string → requests go to localhost:3000, proxied to the real API
//            (see "proxy" in package.json) — this avoids cross-origin cookie issues
export const baseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? HOSTED_API : "");

axios.defaults.withCredentials = true;
axios.defaults.maxContentLength = 50 * 1024 * 1024;
axios.defaults.maxBodyLength = 50 * 1024 * 1024;

export const getConfig = () => ({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default axios;