import React from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "../store";

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-center" richColors />
    </Provider>
  );
};
