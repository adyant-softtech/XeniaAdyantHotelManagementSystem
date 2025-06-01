// /**
//  * Created by - Ashish Dewangan on 22-05-2024
//  * Reason - Specified axios settings
//  */
// import axios from "axios";
// import * as siteConfig from "./config";

// const baseUrlWithoutApiV1 = siteConfig.default.apiBaseURL.replace(/\/api\/v1\/?$/, "");

// const API = axios.create({
//   baseURL: siteConfig.default.apiBaseURL,
//   timeout: siteConfig.default.apiTimeout,
//   xsrfHeaderName: "X-CSRFToken",
//   xsrfCookieName: "csrftoken",
//   credentails: true,
// });

// API.interceptors.request.use(
//   (config) => {
//     return config;
//   },
//   (error) => {
//     // Promise.reject(error);
//     return error;
//   }
// );

// API.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Promise.reject(error);
//     return error;
//   }
// );

// export default API;

/**
 * Created by - Ashish Dewangan on 22-05-2024
 * Reason - Specified axios settings
 */
import axios from "axios";
import * as siteConfig from "./config";

const API = axios.create({
  baseURL: siteConfig.default.apiBaseURL, // with /api/v1
  timeout: siteConfig.default.apiTimeout,
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
  credentials: true,
});

const APIWithoutV1 = axios.create({
  baseURL: siteConfig.default.baseURL, // without /api/v1
  timeout: siteConfig.default.apiTimeout,
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
  credentials: true,
});

[API, APIWithoutV1].forEach((instance) => {
  instance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );
  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );
});

export { APIWithoutV1 };
export default API;
