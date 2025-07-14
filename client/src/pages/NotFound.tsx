import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <h1 className="text-9xl font-bold text-primary">404</h1>

      <p className="text-2xl font-semibold mt-4 text-center">
        Oops! The page you're looking for doesn't exist.
      </p>

      <p className="text-muted-foreground mt-2 text-center">
        It seems like you've wandered off into the unknown. Let's get you back
        on track.
      </p>

      <Button
        className="mt-6 px-6 py-2 text-lg font-semibold bg-primary hover:bg-primary-dark transition-colors duration-200"
        onClick={() => navigate("/")}
      >
        Go Back Home
      </Button>

      <img
        src="/404-illustration.svg"
        alt="404 Illustration"
        className="mt-8 w-64 h-64 object-contain"
      />
    </div>
  );
};

export default NotFound;
