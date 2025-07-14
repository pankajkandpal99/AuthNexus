import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  forgotPasswordSchema,
  ForgotPasswordValues,
} from "../schema/authSchema";
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
import { requestPasswordReset } from "../features/auth/auth.slice";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    const result = await dispatch(requestPasswordReset(data));
    if (requestPasswordReset.fulfilled.match(result)) {
      navigate("/password-reset-sent", { replace: true });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 md:px-8">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl text-primary sm:text-2xl font-bold text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a password reset link
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your registered email"
                        {...field}
                      />
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
                {loading ? <Loader size="small" /> : "Send Reset Link"}
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

export default ForgotPassword;
