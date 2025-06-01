import axios from "axios";
import * as siteConfig from "../constants/APIConstants";

const HttpClient = axios.create({
  baseURL: siteConfig.default.apiBaseURL,
  timeout: siteConfig.default.apiTimeout,
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
  credentails: true,
});

HttpClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    // Promise.reject(error);
    return error;
  }
);

HttpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Promise.reject(error);
    return error;
  }
);

export default HttpClient;
