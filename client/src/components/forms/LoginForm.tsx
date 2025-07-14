import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { loginFormSchema, LoginFormValues } from "../../schema/authSchema";
import { Loader } from "../general/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../features/auth/auth.slice";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, authenticated } = useAppSelector(
    (state) => state.auth
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await dispatch(loginUser(data));
  };

  useEffect(() => {
    if (authenticated) {
      navigate("/", { replace: true });
    }
  }, [authenticated, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 md:px-8">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl text-primary sm:text-2xl font-bold text-center">
            Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to log in.
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
                        placeholder="Enter email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-sm font-medium">
                        Password
                      </FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-xs hover:underline text-primary"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className={`w-full p-2 text-sm pr-10 ${
                            fieldState.error
                              ? "border-red-400 focus-visible:ring-red-400"
                              : ""
                          }`}
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
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full mt-6 bg-primary hover:bg-orange-600 cursor-pointer"
                disabled={loading}
              >
                {loading ? <Loader size="small" /> : "Log In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="">Don't have an account?</span>
          <Link
            to="/register"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
