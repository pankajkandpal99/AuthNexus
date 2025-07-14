import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

const PasswordResetSuccess: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 md:px-8">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-primary" />
          <CardTitle className="text-2xl font-bold">Password Updated</CardTitle>
          <CardDescription>
            Your password has been successfully reset
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            You can now log in with your new password
          </p>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button asChild className="w-full">
            <Link to="/login">Continue to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PasswordResetSuccess;
