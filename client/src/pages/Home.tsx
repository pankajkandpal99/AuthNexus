import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { verifyAuth } from "../features/auth/auth.slice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  LockKeyhole,
  User,
  Rocket,
  Users,
  Settings,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Globe,
  Database,
  Crown,
  BarChart3,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Skeleton } from "../components/ui/skeleton";
import { getFullImageUrl } from "../utils/imageUtils";
import { toast } from "sonner";

const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.user);
  const {
    authenticated,
    initialized,
    loading: authLoading,
  } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) {
      dispatch(verifyAuth());
    }
  }, [dispatch, initialized]);

  // Helper function to get role display info
  const getRoleDisplayInfo = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          label: "⚡ Super Administrator",
          bgColor: "bg-gradient-to-r from-purple-100 to-pink-100",
          textColor: "text-purple-800",
          icon: Crown,
        };
      case "ADMIN":
        return {
          label: "👑 Administrator",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          icon: Shield,
        };
      default:
        return {
          label: "👤 Member",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          icon: User,
        };
    }
  };

  if (!initialized || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-16 w-2/3 mx-auto rounded-2xl" />
            <Skeleton className="h-8 w-1/2 mx-auto rounded-xl" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="space-y-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-6 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Shield,
      title: "Advanced Security",
      description: "JWT authentication with refresh tokens",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Redis caching for optimal performance",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Database,
      title: "Robust Database",
      description: "MySQL with Sequelize ORM",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Globe,
      title: "Social Login",
      description: "Seamless Google authentication",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const securityFeatures = [
    "🔐 Encrypted Password Storage",
    "🔄 Automatic Token Refresh",
    "🛡️ Protected API Routes",
    "📧 Email Verification System",
    "🔒 Role-Based Access Control",
    "⚡ Redis Session Management",
  ];

  const roleInfo = currentUser ? getRoleDisplayInfo(currentUser.role) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            {authenticated && currentUser ? (
              <div className="animate-fade-in">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-2xl ring-4 ring-purple-100 transition-all duration-300 group-hover:scale-105">
                      <AvatarImage
                        src={getFullImageUrl(
                          currentUser.profileImage as string
                        )}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {currentUser.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                      Welcome back, {currentUser.username}!
                    </h1>
                    <div className="flex items-center justify-center space-x-4 text-lg">
                      <span className="text-gray-600">{currentUser.email}</span>
                      <span className="text-gray-400">•</span>
                      {roleInfo && (
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${roleInfo.bgColor} ${roleInfo.textColor} flex items-center space-x-2`}
                        >
                          <span>{roleInfo.label}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in space-y-6">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-800 font-medium">
                    Secure Authentication System
                  </span>
                </div>

                <h1 className="text-6xl font-bold">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    AuthNexus
                  </span>
                </h1>

                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  A cutting-edge authentication system built with modern MERN
                  stack technology. Secure, scalable, and user-friendly.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md"
                    >
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                      <span className="text-sm font-medium text-gray-700">
                        {feature.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {!authenticated ? (
            <>
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-indigo-400/0 group-hover:from-blue-400/5 group-hover:to-indigo-400/5 transition-all duration-300"></div>
                <CardHeader className="relative space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Create Account
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Join our secure platform today
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/register", { replace: false });
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-200 group"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/5 group-hover:to-pink-400/5 transition-all duration-300"></div>
                <CardHeader className="relative space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <LockKeyhole className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Sign In
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Access your account securely
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login", { replace: false });
                    }}
                    variant="outline"
                    className="w-full border-2 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 font-medium py-3 rounded-xl transition-all duration-200 group hover:bg-purple-50"
                  >
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-emerald-50 to-green-50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-green-400/0 group-hover:from-emerald-400/5 group-hover:to-green-400/5 transition-all duration-300"></div>
                <CardHeader className="relative space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      My Profile
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      View and edit your information
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/my-profile", { replace: false });
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium py-3 rounded-xl transition-all duration-200 group"
                  >
                    View Profile
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-red-400/0 group-hover:from-orange-400/5 group-hover:to-red-400/5 transition-all duration-300"></div>
                <CardHeader className="relative space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Browse Users
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Discover and connect with others
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/users", { replace: false });
                    }}
                    variant="outline"
                    className="w-full border-2 border-orange-200 hover:border-orange-300 text-orange-700 hover:text-orange-800 font-medium py-3 rounded-xl transition-all duration-200 group hover:bg-orange-50"
                  >
                    Explore Users
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              {/* Super Admin Card */}
              {currentUser?.role === "SUPER_ADMIN" && (
                <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-indigo-400/0 group-hover:from-purple-400/5 group-hover:to-indigo-400/5 transition-all duration-300"></div>
                  <CardHeader className="relative space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800">
                        Super Admin Panel
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Ultimate system control
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/super-admin", { replace: false });
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-200 group"
                    >
                      Super Admin
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Admin Card */}
              {(currentUser?.role === "ADMIN" ||
                currentUser?.role === "SUPER_ADMIN") && (
                <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-red-50 to-pink-50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400/0 to-pink-400/0 group-hover:from-red-400/5 group-hover:to-pink-400/5 transition-all duration-300"></div>
                  <CardHeader className="relative space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800">
                        Admin Panel
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Manage system and users
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/dashboard", { replace: false });
                      }}
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium py-3 rounded-xl transition-all duration-200 group"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* System Analytics Card (Super Admin Only) */}
              {currentUser?.role === "SUPER_ADMIN" && (
                <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-cyan-50 to-blue-50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-blue-400/0 group-hover:from-cyan-400/5 group-hover:to-blue-400/5 transition-all duration-300"></div>
                  <CardHeader className="relative space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800">
                        System Analytics
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        View detailed system metrics
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/analytics", { replace: false });
                      }}
                      variant="outline"
                      className="w-full border-2 border-cyan-200 hover:border-cyan-300 text-cyan-700 hover:text-cyan-800 font-medium py-3 rounded-xl transition-all duration-200 group hover:bg-cyan-50"
                    >
                      View Analytics
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
            >
              <div
                className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
              <CardHeader className="relative space-y-4">
                <div
                  className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-800">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Security First</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-800">
              Built with Security in Mind
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {securityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-sm"
                >
                  <span className="text-lg">{feature.split(" ")[0]}</span>
                  <span className="text-gray-700 font-medium">
                    {feature.substring(feature.indexOf(" ") + 1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Super Admin Alert */}
        {authenticated && currentUser?.role === "SUPER_ADMIN" && (
          <Alert className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <AlertDescription className="text-purple-800">
                <strong>Super Administrator Access!</strong> You have ultimate
                system privileges and can access all administrative functions.{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 text-purple-700 hover:text-purple-800 font-bold underline"
                  onClick={() => {
                    // e.preventDefault();
                    // navigate("/super-admin", { replace: false });
                    toast.info(
                      "super admin dashbaord will implement in future"
                    );
                  }}
                >
                  Visit Super Admin Panel →
                </Button>
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Admin Alert */}
        {authenticated && currentUser?.role === "ADMIN" && (
          <Alert className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <AlertDescription className="text-red-800">
                <strong>Admin Access Granted!</strong> You have administrative
                privileges.{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 text-red-700 hover:text-red-800 font-bold underline"
                  onClick={() => {
                    // e.preventDefault();
                    // navigate("/dashboard", { replace: false });
                    toast.info("admin dashbaord will implement in future");
                  }}
                >
                  Visit Admin Dashboard →
                </Button>
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Assignment Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5"></div>
          <CardHeader className="relative">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-blue-800">
                  Full Stack Assignment Demo
                </CardTitle>
                <CardDescription className="text-blue-600">
                  MERN Stack with Modern Technologies
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              <p className="text-blue-700 leading-relaxed">
                This application demonstrates a complete authentication system
                built with cutting-edge technologies including React, Redux
                Toolkit, Node.js, Express, MySQL, Sequelize, Redis, and JWT
                authentication with multi-level role-based access control.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "React",
                  "Redux",
                  "Node.js",
                  "MySQL",
                  "Redis",
                  "JWT",
                  "Sequelize",
                  "Tailwind CSS",
                  "Role-Based Access",
                ].map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;
