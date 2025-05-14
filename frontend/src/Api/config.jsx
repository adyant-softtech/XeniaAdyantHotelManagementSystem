/**
 * Created by - Ashish Dewangan on 22-05-2024
 * Reason - To specify frontend configurations
 */

export const baseURL = "http://xeniaindia.in:8000";
export const domainURL = "xeniaindia.in:8000";
export const httpMethod = "http://"
export const domain = "xeniaindia"

const config = {
  baseURL : baseURL,
  apiBaseURL: `${baseURL}/api/v1`,
  staticBaseURL: `${baseURL}/static/`,
  apiTimeout: 5000000,
};

export default config;
