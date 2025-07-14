import { Link, useLocation } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

const EmailVerificationSent = () => {
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:px-6 md:px-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <MailCheck className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Verification Email Sent!
          </h2>
          <p className="text-gray-600">
            We've sent a verification link to <strong>{email}</strong>. Please
            check your email and click the link to verify your account.
          </p>

          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <a
                href={`https://mail.google.com/mail/u/?authuser=${email}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Gmail
              </a>
            </Button>
            <Button asChild className="w-full">
              <Link to="/login">Back to Login</Link>
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder.
            {/* <Button variant="link" className="p-0 h-auto">
              resend verification email
            </Button> */}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default EmailVerificationSent;
