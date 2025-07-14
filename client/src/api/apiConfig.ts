import { API_BASE_URL } from "../config/config";

const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
    REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/v1/auth/verify-email`,
    REQUEST_PASSWORD_RESET: `${API_BASE_URL}/api/v1/auth/request-password-reset`,
    RESET_PASSWORD: `${API_BASE_URL}/api/v1/auth/reset-password`,
  },
  USER: {
    CURRENT_USER: `${API_BASE_URL}/api/v1/users/me`,
    PROFILE: `${API_BASE_URL}/api/v1/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/v1/users/update/profile`,
  },
  ADMIN: {
    ALL_USERS: `${API_BASE_URL}/api/v1/users`,
    USER_BY_ID: `${API_BASE_URL}/api/v1/user`,
    UPDATE_USER: `${API_BASE_URL}/api/v1/user/update`, // New
    DELETE_USER: `${API_BASE_URL}/api/v1/user`,
    SEARCH_USERS: `${API_BASE_URL}/api/v1/users/search`,
  },
};

export { API_ENDPOINTS };
