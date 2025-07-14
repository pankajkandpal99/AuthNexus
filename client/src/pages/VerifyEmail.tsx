import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/config";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader } from "../components/general/Loader";
import { Alert } from "../components/ui/alert";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!queryToken) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      setStatus("loading");
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/verify-email/${queryToken}`
        );

        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");

        // Start countdown for redirect
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate("/login");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (error) {
        setStatus("error");
        if (axios.isAxiosError(error)) {
          setMessage(error.response?.data?.message || "Verification failed");
        } else {
          setMessage("An unexpected error occurred");
        }
      }
    };

    verifyEmail();
  }, [queryToken, navigate]);

  const resendVerification = async () => {
    setStatus("loading");
    try {
      await axios.post(`${API_BASE_URL}/api/v1/auth/resend-verification`, {
        token,
      });
      setStatus("success");
      setMessage("New verification email sent!");
    } catch (error) {
      setStatus("error");
      if (axios.isAxiosError(error)) {
        setMessage(
          error.response?.data?.message || "Failed to resend verification email"
        );
      } else {
        setMessage("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader />
              <p className="mt-4">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Email Verified!
              </h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-gray-500 text-sm">
                Redirecting to login in {countdown} seconds...
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Go to Login Now
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Verification Failed
              </h2>
              <Alert variant="destructive">{message}</Alert>

              {message.includes("expired") && (
                <Button
                  variant="outline"
                  onClick={resendVerification}
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() => navigate("/register")}
                className="w-full mt-2"
              >
                Back to Registration
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
