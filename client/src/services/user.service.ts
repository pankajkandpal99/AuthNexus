/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { API_ENDPOINTS } from "../api/apiConfig";
import axiosInstance from "../utils/axiosConfig";
import { UpdateProfileFormValues } from "../schema/authSchema";

export const UserService = {
  async getCurrentUser() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER.CURRENT_USER);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const serverError = error.response.data;
        throw new Error(serverError.error || "Failed to fetch user details");
      }
      throw new Error("Network error occurred. Please try again.");
    }
  },

  async getProfile() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER.PROFILE);
      return response.data;
    } catch (error) {
      console.error("[USER_SERVICE] Get profile error : ", error);
      throw error;
    }
  },

  async updateProfile(data: UpdateProfileFormValues) {
    try {
      const formData = new FormData();

      if (data.username) {
        formData.append("username", data.username);
      }

      if (data.profileImage instanceof File) {
        formData.append("profileImage", data.profileImage);
      }

      const response = await axiosInstance.put(
        `${API_ENDPOINTS.USER.UPDATE_PROFILE}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("[USER_SERVICE] Profile update error:", error);
      if (axios.isAxiosError(error) && error.response) {
        const serverError = error.response.data;
        throw new Error(serverError.message || "Profile update failed");
      }
      throw new Error("Network error occurred. Please try again.");
    }
  },

  async getAllUsers(page: number = 1, limit: number = 10) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.ALL_USERS, {
        params: { page, limit },
      });

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        const serverError = error.response.data;
        throw new Error(serverError.error || "Failed to fetch users");
      }
      throw new Error("Network error occurred. Please try again.");
    }
  },

  async getUserById(id: string) {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.ADMIN.USER_BY_ID}/${id}`
      );

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        const serverError = error.response.data;
        throw new Error(serverError.error || "Failed to fetch user details");
      }
      throw new Error("Network error occurred. Please try again.");
    }
  },

  async updateUser(data: { id: string; role?: string; status?: string }) {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.ADMIN.UPDATE_USER,
        data
      );

      console.log("updated user in service : ", response);

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        const serverError = error.response.data;
        throw new Error(serverError.error || "Failed to update user");
      }
      throw new Error("Network error occurred. Please try again.");
    }
  },

  async deleteUser(id: string) {
    try {
      const response = await axiosInstance.delete(
        `${API_ENDPOINTS.ADMIN.DELETE_USER}/${id}`
      );

      console.log("deleted user in service : ", response);

      return response.data;
    } catch (error: any) {
      if (error.response) {
        const serverError = error.response.data;
        throw new Error(serverError.error || "Failed to delete user");
      }
      throw new Error("Network error occurred. Please try again.");
    }
  },

  async searchUsers(query: string) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.SEARCH_USERS,
        {
          params: { query },
        }
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        const serverError = error.response.data;
        throw new Error(serverError.error || "Search failed");
      }
      throw new Error("Network error occurred. Please try again.");
    }
  },
};
