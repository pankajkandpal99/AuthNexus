import { useEffect } from "react";
import { AppRouter } from "./routes/AppRouter";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { forceLogout, verifyAuth } from "./features/auth/auth.slice";
import { UserService } from "./services/user.service";
import { setUser } from "./features/user/user.slice";
import { Loader } from "./components/general/Loader";

function App() {
  const dispatch = useAppDispatch();
  const { initialized, authenticated } = useAppSelector((state) => state.auth);
  const { currentUser } = useAppSelector((state) => state.user);

  useEffect(() => {
    const initializeAuth = async () => {
      const authResult = await dispatch(verifyAuth()); // Check if token exists and is valid

      if (authResult.meta.requestStatus === "fulfilled") {
        const payload = authResult.payload as { authenticated: boolean };
        if (payload.authenticated && !currentUser) {
          try {
            const userData = await UserService.getCurrentUser();
            dispatch(setUser(userData.data));
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            // If user data fetch fails, might need to refresh token
            dispatch(forceLogout());
          }
        }
      }
    };

    initializeAuth();
  }, [dispatch, currentUser, authenticated]);

  if (!initialized) {
    return <Loader size="large" />;
  }

  return <AppRouter />;
}

export default App;
