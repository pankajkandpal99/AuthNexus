import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit3,
  Check,
  X,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Globe,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { RootState } from "../store";
import { getFullImageUrl } from "../utils/imageUtils";
import { ProfileImageUploader } from "../components/general/ProfileImageUploader";
import {
  UpdateProfileFormValues,
  updateProfileSchema,
} from "../schema/authSchema";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserProfile } from "../features/user/user.slice";

const MyProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state: RootState) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      profileImage: currentUser?.profileImage || undefined,
    },
  });

  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const userInitial =
    currentUser?.username?.charAt(0) || currentUser?.email?.charAt(0) || "U";

  const onSubmit = async (data: UpdateProfileFormValues) => {
    setLoading(true);
    try {
      if (!currentUser?.id) {
        throw new Error("User ID not found");
      }

      await dispatch(updateUserProfile(data)).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    form.reset({
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      profileImage: currentUser?.profileImage || undefined,
    });
    setIsEditing(false);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProfileCompletionPercentage = () => {
    if (!currentUser) return 0;
    let completed = 0;
    const total = 4; // Reduced from 6 to only essential fields

    if (currentUser.username) completed++;
    if (currentUser.email) completed++;
    if (currentUser.profileImage) completed++;
    if (currentUser.isVerified || currentUser.isEmailVerified) completed++;

    return Math.round((completed / total) * 100);
  };

  const getActivityStatus = () => {
    if (!currentUser?.lastActive) return "Unknown";
    const now = new Date();
    const lastActive = new Date(currentUser.lastActive);
    const diffInMinutes = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 5) return "Online";
    if (diffInMinutes < 30) return "Recently Active";
    if (diffInMinutes < 1440) return "Active Today";
    return "Inactive";
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <p className="text-muted-foreground">
            Please login to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const profileCompletion = getProfileCompletionPercentage();
  const activityStatus = getActivityStatus();
  const isAdmin =
    currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account information
            </p>
          </div>

          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="gap-2"
              variant="outline"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={loading}
                className="gap-2"
                size="sm"
              >
                <Check className="h-4 w-4" />
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="relative mx-auto">
                {isEditing ? (
                  <Form {...form}>
                    <FormField
                      control={form.control}
                      name="profileImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ProfileImageUploader
                              value={field.value as File}
                              onChange={(file) => field.onChange(file)}
                              currentImage={
                                getFullImageUrl(
                                  currentUser.profileImage as string
                                ) || defaultAvatar
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Form>
                ) : (
                  <div className="relative">
                    <Avatar className="w-32 h-32 mx-auto">
                      <AvatarImage
                        src={
                          getFullImageUrl(currentUser.profileImage as string) ||
                          defaultAvatar
                        }
                        alt={currentUser.username || "User"}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                        {userInitial.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <div className="bg-background rounded-full p-2 shadow-lg border">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <CardTitle className="text-xl">
                  {currentUser.username}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {currentUser.email}
                </CardDescription>
              </div>

              {/* Only show role badge for admins */}
              {isAdmin && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <Badge variant="secondary">
                    <Shield className="h-3 w-3 mr-1" />
                    {currentUser.role}
                  </Badge>
                </div>
              )}

              {/* Profile Completion - Simplified */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Profile Complete</span>
                  <span className="text-sm text-muted-foreground">
                    {profileCompletion}%
                  </span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>

              {/* Activity Status */}
              {/* <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 justify-center">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">{activityStatus}</span>
                </div>
              </div> */}
              {/* Activity Status - Improved Version */}
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Activity Status</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        activityStatus === "Online"
                          ? "bg-green-500 animate-pulse"
                          : activityStatus === "Recently Active"
                          ? "bg-emerald-400"
                          : activityStatus === "Active Today"
                          ? "bg-amber-400"
                          : "bg-gray-400"
                      }`}
                    ></div>

                    <div className="text-sm">
                      {activityStatus === "Online" ? (
                        <span className="text-green-600">Currently online</span>
                      ) : activityStatus === "Recently Active" ? (
                        <span className="text-emerald-600">
                          Active within last 30 minutes
                        </span>
                      ) : activityStatus === "Active Today" ? (
                        <span className="text-amber-600">Active today</span>
                      ) : (
                        <span className="text-gray-500">
                          Inactive (last seen{" "}
                          {formatDate(currentUser.lastActive as Date)})
                        </span>
                      )}
                    </div>
                  </div>

                  {currentUser.lastActive && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Last active: {formatDate(currentUser.lastActive)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and verification status
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {isEditing ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              {...field}
                              disabled // Email shouldn't be editable directly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Username</p>
                      <p className="text-sm text-muted-foreground">
                        {currentUser.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                    <div>
                      {currentUser.isVerified || currentUser.isEmailVerified ? (
                        <Badge
                          // variant="default"
                          className="gap-1 text-green-500 bg-green-100 py-1 px-2"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Authentication Method</p>
                      <Badge variant="outline" className="capitalize">
                        {currentUser.provider.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Activity Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(currentUser.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Last Active</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(currentUser.lastActive as Date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Only show sensitive info section for admins */}
              {isAdmin && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Admin Information</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                      >
                        {showSensitiveInfo ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {showSensitiveInfo && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Technical Details
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium">User ID:</span>
                            <span className="ml-2 font-mono text-muted-foreground">
                              {currentUser.id}
                            </span>
                          </div>
                          {currentUser.providerId && (
                            <div>
                              <span className="font-medium">Provider ID:</span>
                              <span className="ml-2 font-mono text-muted-foreground">
                                {currentUser.providerId}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Status:</span>
                            <span className="ml-2 text-muted-foreground capitalize">
                              {currentUser.status.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default MyProfile;
