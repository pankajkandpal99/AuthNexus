import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  userId: string;
  role: string;
  tokenType: string;
  exp: number;
  iat: number;
}

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const checkAuthToken = (): boolean => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    // console.log("[AUTH_UTILS] No token found");
    return false;
  }

  const isValid = verifyTokenClientSide(); // Check if token is valid and not expired
  return isValid;
};

export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    // console.log(
    //   "[AUTH_UTILS] getToken result:",
    //   token ? "Token exists" : "No token"
    // );
    return token;
  } catch (error) {
    console.error("[AUTH_UTILS] Error accessing localStorage:", error);
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    // console.log(
    //   "[AUTH_UTILS] getRefreshToken result:",
    //   refreshToken ? "Refresh token exists" : "No refresh token"
    // );
    return refreshToken;
  } catch (error) {
    console.error("[AUTH_UTILS] Error accessing localStorage:", error);
    return null;
  }
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (!accessToken || !refreshToken) {
    console.error("[AUTH_UTILS] Both tokens are required");
    throw new Error("Both tokens are required");
  }

  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  } catch (error) {
    console.error("[AUTH_UTILS] Failed to set auth tokens:", error);
    throw error;
  }
};

export const clearAuthData = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
  } catch (error) {
    console.error("[AUTH_UTILS] Error clearing auth data:", error);
  }
};

export const handleAuthentication = (response: {
  tokens: { accessToken: string; refreshToken: string };
}): void => {
  if (!response?.tokens?.accessToken || !response?.tokens?.refreshToken) {
    console.error("[AUTH_UTILS] Tokens not found in response");
    throw new Error("Tokens not found in response");
  }
  setTokens(response.tokens.accessToken, response.tokens.refreshToken);
};

export const verifyTokenClientSide = (): boolean => {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    const isValid = decoded.exp > currentTime;

    // console.log("[AUTH_UTILS] Token expires at:", new Date(decoded.exp * 1000));
    // console.log("[AUTH_UTILS] Current time:", new Date());

    return isValid;
  } catch (error) {
    console.error("[AUTH_UTILS] Token verification failed:", error);
    return false;
  }
};

export const isTokenExpired = (): boolean => {
  const token = getToken();
  if (!token) {
    return true;
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    const isExpired = decoded.exp <= currentTime;

    return isExpired;
  } catch (error) {
    console.error("[AUTH_UTILS] Token expiry check failed:", error);
    return true;
  }
};

export const logout = (): void => {
  clearAuthData();
  // Force reload to clear any cached state
  window.location.href = "/login";
};

export const isTokenExpiringSoon = (): boolean => {
  const token = getToken();
  if (!token) {
    return true;
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    const timeUntilExpiry = decoded.exp - currentTime;
    const isExpiringSoon = timeUntilExpiry < 300; // 5 minutes in seconds

    // console.log("[AUTH_UTILS] Token expires in:", timeUntilExpiry, "seconds");
    // console.log("[AUTH_UTILS] Is token expiring soon:", isExpiringSoon);
    return isExpiringSoon;
  } catch (error) {
    console.error("[AUTH_UTILS] Token expiration check failed:", error);
    return true;
  }
};
