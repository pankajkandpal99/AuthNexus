import React, { Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import {
  notFoundRoute,
  protectedRoutes,
  publicRoutes,
  authRoutes,
} from "./routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { Loader } from "../components/general/Loader";
import { MainLayout } from "../layouts/mainLayout";
import { AuthRoute } from "./AuthRoute";

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route>
            {publicRoutes.map(({ path, element, fullWidth }) => (
              <Route
                key={path}
                path={path}
                element={
                  <MainLayout fullWidth={fullWidth}>
                    {React.createElement(element)}
                  </MainLayout>
                }
              />
            ))}
          </Route>

          <Route element={<AuthRoute />}>
            {authRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={React.createElement(element)}
              />
            ))}
          </Route>

          <Route element={<ProtectedRoute />}>
            {protectedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={React.createElement(element)}
              />
            ))}
          </Route>

          <Route
            path={notFoundRoute.path}
            element={React.createElement(notFoundRoute.element)}
          />
        </Routes>
      </Suspense>
    </Router>
  );
};
