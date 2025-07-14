import { API_BASE_URL } from "../config/config";

export const getFullImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("https")) return path;

  return `${API_BASE_URL}${path}`;
};
