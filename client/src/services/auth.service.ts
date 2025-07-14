import axios from "axios";
import { LoginFormValues, RegisterFormValues } from "../schema/authSchema";
import { API_BASE_URL } from "../config/config";
import axiosInstance from "../utils/axiosConfig";
import { API_ENDPOINTS } from "../api/apiConfig";

export const authApiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const AuthService = {
  async register(data: RegisterFormValues) {
    try {
      const formData = new FormData();

      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
      }

      const response = await authApiClient.post(
        API_ENDPOINTS.AUTH.REGISTER,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("[AUTH_SERVICE] Registration error:", error);
      if (axios.isAxiosError(error) && error.response) {
        const serverError = error.response.data;
        throw new Error(serverError.message || "Registration failed");
      }
      throw new Error("Network error occurred. Please try again.");
    }
  },

  async login(data: LoginFormValues) {
    try {
      const response = await authApiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: data.email,
        password: data.password,
      });

      return {
        token: response.data.data.tokens.accessToken,
        refreshToken: response.data.data.tokens.refreshToken,
        user: response.data.data.user,
      };
    } catch (error) {
      console.error("[AUTH_SERVICE] Login error:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Login failed");
      }
      throw new Error("Network error occurred");
    }
  },

  async refreshToken(refreshToken: string) {
    try {
      // Use plain axios for refresh to avoid circular dependency
      const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken,
      });

      return response.data;
    } catch (error) {
      console.error(
        "[AUTH_SERVICE] Token refresh error in auth service : ",
        error
      );
      if (axios.isAxiosError(error) && error.response) {
        const serverError = error.response.data;
        throw new Error(serverError.message || "Token refresh failed");
      }
      throw new Error("Network error occurred. Please try again.");
    }
  },

  async requestPasswordReset(email: string) {
    try {
      const response = await authApiClient.post(
        API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET,
        { email }
      );

      // console.log(
      //   "response in auth service request password reset : ",
      //   response
      // );

      return response.data;
    } catch (error) {
      console.error("[AUTH_SERVICE] Password reset request error:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Password reset request failed"
        );
      }
      throw new Error("Network error occurred");
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const response = await authApiClient.post(
        `${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`,
        { password: newPassword }
      );

      // console.log("response in auth service reset password : ", response);

      return response.data;
    } catch (error) {
      console.error("[AUTH_SERVICE] Password reset error:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Password reset failed"
        );
      }
      throw new Error("Network error occurred");
    }
  },

  async logout() {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("[AUTH_SERVICE] Logout API call failed:", error);
      // Still proceed with local logout even if API call fails
    }
  },
};
