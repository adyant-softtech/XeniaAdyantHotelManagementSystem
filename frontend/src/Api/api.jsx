/**
 * Created by - Ashish Dewangan on 22-05-2024
 * Reason - Specified axios settings
 */
import axios from "axios";
import * as siteConfig from "./config";

const API = axios.create({
  baseURL: siteConfig.default.apiBaseURL,
  timeout: siteConfig.default.apiTimeout,
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
  credentails: true,
});

API.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    // Promise.reject(error);
    return error;
  }
);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Promise.reject(error);
    return error;
  }
);

export default API;
