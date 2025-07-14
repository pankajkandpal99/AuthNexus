import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { resetPasswordSchema, ResetPasswordValues } from "../schema/authSchema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Loader } from "../components/general/Loader";
import { resetPassword } from "../features/auth/auth.slice";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: token,
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    const result = await dispatch(resetPassword(data));
    if (resetPassword.fulfilled.match(result)) {
      navigate("/password-reset-success", { replace: true });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 md:px-8">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl text-primary sm:text-2xl font-bold text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-500 text-sm text-center rounded">
              {error}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...form.register("token")} />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          {...field}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-muted-foreground cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          {...field}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-muted-foreground cursor-pointer"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full mt-6 bg-primary hover:bg-orange-600 cursor-pointer"
                disabled={loading}
              >
                {loading ? <Loader size="small" /> : "Reset Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Remember your password?</span>
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
