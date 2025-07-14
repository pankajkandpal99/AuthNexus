import { useAuth } from "./useAuth";

export const useAdminAuth = () => {
  const { currentUser, authenticated, initialized, loading } = useAuth();
  const isAdmin = currentUser?.role?.includes("ADMIN");

  return {
    loading,
    authenticated,
    initialized,
    currentUser,
    isAdmin,
  };
};
