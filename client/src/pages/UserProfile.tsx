import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  ArrowLeft,
  Crown,
  Shield,
  User,
  Mail,
  Calendar,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchUserById } from "../features/user/user.slice";
import { Button } from "../components/ui/button";
import { getFullImageUrl } from "../utils/imageUtils";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, viewedUser } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Crown className="h-4 w-4" />;
      case "ADMIN":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30";
      case "ADMIN":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30";
      default:
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
      case "suspended":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
      default:
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Never";
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading user details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center p-8 bg-card-gradient rounded-xl shadow-soft border">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-red-500 font-medium mb-4">{error}</p>
              <Button
                onClick={() => navigate(-1)}
                className="bg-primary-gradient hover:shadow-orange"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!viewedUser) {
    return (
      <div className="min-h-screen bg-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center p-8 bg-card-gradient rounded-xl shadow-soft border">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <p className="text-muted-foreground font-medium mb-4">
                User not found
              </p>
              <Button
                onClick={() => navigate(-1)}
                className="bg-primary-gradient hover:shadow-orange"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary-gradient rounded-xl flex items-center justify-center shadow-orange">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-primary">
                User Profile
              </h1>
              <p className="text-muted-foreground">Detailed user information</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto hover:bg-primary hover:text-white hover:border-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card-gradient rounded-xl shadow-soft border p-6 hover-lift">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  {viewedUser.profileImage ? (
                    <img
                      src={getFullImageUrl(viewedUser.profileImage)}
                      alt={viewedUser.username}
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20 shadow-lg"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-primary-gradient flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {viewedUser.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div
                    className={`absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-4 border-white shadow-lg ${
                      viewedUser.status === "active"
                        ? "bg-green-500"
                        : viewedUser.status === "suspended"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                </div>

                <h2 className="text-xl font-bold text-foreground mb-1 truncate">
                  {viewedUser.username}
                </h2>
                <p className="text-muted-foreground text-sm mb-4 truncate">
                  {viewedUser.email}
                </p>

                {/* Role Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${getRoleColor(
                    viewedUser.role
                  )}`}
                >
                  {getRoleIcon(viewedUser.role)}
                  <span>{viewedUser.role.replace("_", " ")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Cards */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status & Verification */}
            <div className="bg-card-gradient rounded-xl shadow-soft border p-6 hover-lift">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Status & Verification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Status
                  </label>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                      viewedUser.status
                    )}`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        viewedUser.status === "active"
                          ? "bg-green-500"
                          : viewedUser.status === "suspended"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className="capitalize">{viewedUser.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Email Status
                  </label>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${
                      viewedUser.isEmailVerified
                        ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                    }`}
                  >
                    {viewedUser.isEmailVerified ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span>
                      {viewedUser.isEmailVerified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Information */}
            <div className="bg-card-gradient rounded-xl shadow-soft border p-6 hover-lift">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Activity Information
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Last Login
                      </span>
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {formatDate(viewedUser.lastLogin)}
                    </p>
                  </div>

                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Last Active
                      </span>
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {formatDate(viewedUser.lastActive)}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Account Created
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    {formatDate(viewedUser.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-card-gradient rounded-xl shadow-soft border p-6 hover-lift">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Information
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Email Address
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium break-all">
                    {viewedUser.email}
                  </p>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Username
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium break-all">
                    {viewedUser.username}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-friendly Bottom Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto hover:bg-primary hover:text-white hover:border-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
