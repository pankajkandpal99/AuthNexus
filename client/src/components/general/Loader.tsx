import React from "react";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: "small" | "large";
}

export const Loader: React.FC<LoaderProps> = ({ size = "large" }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        size === "large" ? "h-screen w-full" : ""
      }`}
    >
      <Loader2
        className={`animate-spin ${
          size === "small" ? "w-5 h-5 text-white" : "w-10 h-10 text-primary"
        }`}
        size={size === "small" ? 20 : 40}
      />
    </div>
  );
};
