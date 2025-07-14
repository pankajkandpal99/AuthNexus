import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { MainLayout } from "../layouts/mainLayout";
import { Loader } from "../components/general/Loader";

export const AuthRoute = () => {
  const { authenticated, initialized, loading } = useAuth();

  if (loading || !initialized) {
    return (
      <MainLayout>
        <Loader size="large" />
      </MainLayout>
    );
  }

  if (authenticated) {
    // Redirect authenticated users to home page
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
