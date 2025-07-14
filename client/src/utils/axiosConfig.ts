/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { API_BASE_URL } from "../config/config";
import {
  getToken,
  getRefreshToken,
  setTokens,
  logout,
  isTokenExpired,
} from "./authUtils";

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedRequests: Array<{
  onSuccess: (token: string) => void;
  onFailure: (error: any) => void;
}> = [];

const processFailedRequests = (token: string | null, error?: any) => {
  failedRequests.forEach((req) => {
    if (token) {
      req.onSuccess(token);
    } else {
      // console.log("[AXIOS] Rejecting failed request");
      req.onFailure(error);
    }
  });
  failedRequests = [];
};

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired()) {
        // If already refreshing, wait for it to complete
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedRequests.push({
              onSuccess: (newToken: string) => {
                config.headers.Authorization = `Bearer ${newToken}`;
                resolve(config);
              },
              onFailure: (error: any) => {
                reject(error);
              },
            });
          });
        }

        // Try to refresh token
        try {
          const newToken = await refreshTokens();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        } catch (error) {
          logout();
          return Promise.reject(error);
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // console.log("[AXIOS] No token found for request");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to refresh tokens
const refreshTokens = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  isRefreshing = true;

  try {
    // Create a new axios instance to avoid circular dependency
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      {
        refreshToken,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("[AXIOS] Refresh token response received");
    // console.log("[AXIOS] Response data:", response.data);

    const responseData = response.data.data || response.data;
    const { accessToken, refreshToken: newRefreshToken } =
      responseData.tokens || responseData;

    if (!accessToken || !newRefreshToken) {
      throw new Error("Invalid token response structure");
    }

    setTokens(accessToken, newRefreshToken);
    processFailedRequests(accessToken);

    return accessToken;
  } catch (refreshError) {
    // If refresh fails, process failed requests with error
    processFailedRequests(null, refreshError);

    // Clear tokens and logout
    logout();
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
};

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedRequests.push({
            onSuccess: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            onFailure: (err: any) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshTokens();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import axios from "axios";
// import { API_BASE_URL } from "../config/config";
// import { getToken, getRefreshToken, setTokens, logout } from "./authUtils";

// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// let isRefreshing = false;
// let failedRequests: Array<{
//   onSuccess: (token: string) => void;
//   onFailure: (error: any) => void;
// }> = [];

// const processFailedRequests = (token: string | null, error?: any) => {
//   failedRequests.forEach((req) => {
//     if (token) {
//       req.onSuccess(token);
//     } else {
//       req.onFailure(error);
//     }
//   });
//   failedRequests = [];
// };

// // Request interceptor to add token to headers
// axiosInstance.interceptors.request.use(
//   (config) => {
//     console.log("enter in axios interceptors request 1 ");
//     const token = getToken();
//     if (token) {
//       console.log("enter in axios interceptors request 2 ");
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor to handle token refresh
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     console.log("enter in axios interceptors response 1 ");

//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       console.log("enter in axios interceptors response 2 ");

//       if (isRefreshing) {
//         console.log("enter in axios interceptors response 3 ");

//         // If already refreshing, queue the request
//         return new Promise((resolve, reject) => {
//           failedRequests.push({
//             onSuccess: (token: string) => {
//               console.log("enter in axios interceptors response 4 ");

//               originalRequest.headers.Authorization = `Bearer ${token}`;
//               resolve(axiosInstance(originalRequest));
//             },
//             onFailure: (err: any) => {
//               console.log("enter in axios interceptors response 5 ");

//               reject(err);
//             },
//           });
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         console.log("enter in axios interceptors response 6 ");

//         const refreshToken = getRefreshToken();
//         if (!refreshToken) {
//           console.log("enter in axios interceptors response 7 ");

//           logout();
//           return Promise.reject(error);
//         }

//         console.log("enter in axios interceptors response 8 ");

//         // Call refresh endpoint
//         const response = await axios.post(
//           `${API_BASE_URL}/api/v1/auth/refresh`,
//           {
//             refreshToken,
//           }
//         );
//         console.log("response in axios interceptors :", response);

//         const { accessToken, refreshToken: newRefreshToken } = response.data;
//         console.log("accesstoken in axiosInterceptors : ", accessToken);
//         console.log("accesstoken in axiosInterceptors : ", newRefreshToken);

//         setTokens(accessToken, newRefreshToken);

//         processFailedRequests(accessToken);

//         // Retry original request with new token
//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         // Refresh failed, logout user

//         console.log("enter in axios interceptors response 9 ");

//         processFailedRequests(null, refreshError);
//         logout();
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
