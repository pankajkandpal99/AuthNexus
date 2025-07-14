import React from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

const PasswordResetSent: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 md:px-8">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <MailCheck className="w-12 h-12 mx-auto text-primary" />
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a password reset link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            If you don't see the email, check your spam folder or try resending.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button asChild variant="link" className="text-primary">
            <Link to="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PasswordResetSent;
