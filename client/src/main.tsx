import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppProvider } from "./provider/AppProvider.tsx";

// eslint-disable-next-line react-refresh/only-export-components
const Root = () => {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
};

createRoot(document.getElementById("root")!).render(<Root />);
