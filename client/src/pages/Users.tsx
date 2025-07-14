/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  deleteUserById,
  fetchAllUsers,
  // searchUsers,
  setPagination,
  updateUserRoleStatus,
} from "../features/user/user.slice";
import { Pagination } from "../components/general/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Loader } from "../components/general/Loader";
import { getFullImageUrl } from "../utils/imageUtils";
import {
  Users as UsersIcon,
  Eye,
  Crown,
  Shield,
  User,
  Trash2,
  MoreVertical,
  Search,
  X,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useDebounce } from "../hooks/useDebounce";

const Users = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser, users, loading, pagination, error } = useAppSelector(
    (state) => state.user
  );

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    dispatch(
      fetchAllUsers({
        page: pagination.currentPage,
        limit: pagination.limit,
      })
    );
  }, [dispatch, pagination.currentPage, pagination.limit]);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "username":
          aValue = a.username.toLowerCase();
          bValue = b.username.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "role":
          aValue = a.role;
          bValue = b.role;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "lastActive":
          aValue = a.lastActive ? new Date(a.lastActive).getTime() : 0;
          bValue = b.lastActive ? new Date(b.lastActive).getTime() : 0;
          break;
        default:
          aValue = a.username.toLowerCase();
          bValue = b.username.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, debouncedSearchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  // Statistics based on filtered users
  const filteredStats = useMemo(() => {
    const activeUsers = filteredUsers.filter(
      (u) => u.status === "active"
    ).length;
    const adminUsers = filteredUsers.filter(
      (u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN"
    ).length;

    return {
      totalUsers: filteredUsers.length,
      activeUsers,
      adminUsers,
    };
  }, [filteredUsers]);

  const handlePageChange = (page: number) => {
    dispatch(setPagination({ currentPage: page }));
  };

  const handleUserClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setSortBy("username");
    setSortOrder("asc");
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Helper function to check if current user can edit a target user
  const canEditUser = (targetUser: any) => {
    if (!currentUser) return false;

    if (targetUser.id === currentUser.id) return false; // Can't edit yourself

    if (currentUser.role === "SUPER_ADMIN") return true; // SUPER_ADMIN can edit anyone except themselves

    // ADMIN can edit only USER role, not ADMIN or SUPER_ADMIN
    if (currentUser.role === "ADMIN") {
      return targetUser.role === "USER";
    }

    // USER can't edit anyone
    return false;
  };

  // Helper function to check if current user can delete a target user
  const canDeleteUser = (targetUser: any) => {
    if (!currentUser) return false;

    // Can't delete yourself
    if (targetUser.id === currentUser.id) return false;

    // Only SUPER_ADMIN can delete users
    if (currentUser.role === "SUPER_ADMIN") return true;

    return false;
  };

  const handleEditUser = async (
    userId: string,
    field: "role" | "status",
    value: string
  ) => {
    // Find the target user
    const targetUser = users.find((user) => user.id === userId);
    if (!targetUser) {
      toast.error("User not found");
      return;
    }

    // Check permissions before making the request
    if (!canEditUser(targetUser)) {
      toast.error("You don't have permission to edit this user");
      return;
    }

    // Additional check for role changes - ADMIN can't change roles at all
    if (field === "role" && currentUser?.role === "ADMIN") {
      toast.error("Admins cannot change user roles");
      return;
    }

    try {
      const updates = { id: userId, [field]: value };
      await dispatch(updateUserRoleStatus(updates)).unwrap();
      toast.success("User updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Find the target user
    const targetUser = users.find((user) => user.id === userId);
    if (!targetUser) {
      toast.error("User not found");
      return;
    }

    // Check permissions before making the request
    if (!canDeleteUser(targetUser)) {
      toast.error("You don't have permission to delete this user");
      return;
    }

    try {
      await dispatch(deleteUserById(userId)).unwrap();
      toast.success("User deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Crown className="h-3 w-3" />;
      case "ADMIN":
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading && !users.length) {
    return (
      <div className="min-h-screen bg-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader size="small" />
              <p className="mt-4 text-muted-foreground">Loading users...</p>
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
                <UsersIcon className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-red-500 font-medium">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-primary-gradient hover:shadow-orange"
              >
                Try Again
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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-primary-gradient rounded-xl flex items-center justify-center shadow-orange">
              <UsersIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary">
              Users Management
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage and monitor all users in your system
          </p>
        </div>

        {/* Search and Filters Section */}
        <div className="mb-8">
          <div className="bg-card-gradient rounded-xl border shadow-soft p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 h-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/90 hover:text-gray-700"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px] h-10">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-10">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="lastActive">Last Active</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="h-10 px-3"
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>

                {(searchTerm ||
                  roleFilter !== "all" ||
                  statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSearch}
                    className="h-10 px-3 text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Search Results Info */}
            {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Showing {filteredUsers.length} of {users.length} users
                    {searchTerm && ` matching "${searchTerm}"`}
                  </span>
                  {filteredUsers.length > 0 && (
                    <span>
                      {filteredStats.activeUsers} active •{" "}
                      {filteredStats.adminUsers} admins
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card-gradient rounded-xl p-4 border shadow-soft hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "Filtered"
                    : "Total"}{" "}
                  Users
                </p>
                <p className="text-2xl font-bold text-primary">
                  {filteredStats.totalUsers}
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card-gradient rounded-xl p-4 border shadow-soft hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredStats.activeUsers}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-card-gradient rounded-xl p-4 border shadow-soft hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredStats.adminUsers}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-card-gradient rounded-xl p-4 border shadow-soft hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Page</p>
                <p className="text-2xl font-bold text-primary">
                  {pagination.currentPage} of {pagination.totalPages}
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {pagination.currentPage}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card-gradient rounded-xl shadow-soft border overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "Search Results"
                    : "All Users"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredUsers.length} users displayed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1}{" "}
                  to{" "}
                  {Math.min(
                    pagination.currentPage * pagination.limit,
                    pagination.totalUsers
                  )}{" "}
                  of {pagination.totalUsers}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-muted/30">
                    <TableHead
                      className="text-foreground font-semibold cursor-pointer hover:bg-muted/20"
                      onClick={() => handleSort("username")}
                    >
                      <div className="flex items-center gap-2">
                        User
                        {sortBy === "username" &&
                          (sortOrder === "asc" ? (
                            <SortAsc className="h-3 w-3" />
                          ) : (
                            <SortDesc className="h-3 w-3" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-foreground font-semibold hidden md:table-cell cursor-pointer hover:bg-muted/20"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center gap-2">
                        Email
                        {sortBy === "email" &&
                          (sortOrder === "asc" ? (
                            <SortAsc className="h-3 w-3" />
                          ) : (
                            <SortDesc className="h-3 w-3" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-foreground font-semibold cursor-pointer hover:bg-muted/20"
                      onClick={() => handleSort("role")}
                    >
                      <div className="flex items-center gap-2">
                        Role
                        {sortBy === "role" &&
                          (sortOrder === "asc" ? (
                            <SortAsc className="h-3 w-3" />
                          ) : (
                            <SortDesc className="h-3 w-3" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-foreground font-semibold hidden sm:table-cell cursor-pointer hover:bg-muted/20"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortBy === "status" &&
                          (sortOrder === "asc" ? (
                            <SortAsc className="h-3 w-3" />
                          ) : (
                            <SortDesc className="h-3 w-3" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-foreground font-semibold hidden lg:table-cell cursor-pointer hover:bg-muted/20"
                      onClick={() => handleSort("lastActive")}
                    >
                      <div className="flex items-center gap-2">
                        Last Active
                        {sortBy === "lastActive" &&
                          (sortOrder === "asc" ? (
                            <SortAsc className="h-3 w-3" />
                          ) : (
                            <SortDesc className="h-3 w-3" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="text-foreground font-semibold text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.profileImage ? (
                              <img
                                src={getFullImageUrl(user.profileImage)}
                                alt={user.username}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary-gradient flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div
                              className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                                user.status === "active"
                                  ? "bg-green-500"
                                  : user.status === "suspended"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                              {truncateText(user.username, 20)}
                            </p>
                            <p className="text-xs text-muted-foreground md:hidden truncate max-w-[120px]">
                              {truncateText(user.email, 25)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <span className="text-muted-foreground truncate max-w-[200px] block">
                          {truncateText(user.email, 30)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          {currentUser?.role === "SUPER_ADMIN" &&
                          canEditUser(user) ? (
                            <Select
                              value={user.role}
                              onValueChange={(value) =>
                                handleEditUser(user.id, "role", value)
                              }
                            >
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USER">USER</SelectItem>
                                <SelectItem value="ADMIN">ADMIN</SelectItem>
                                <SelectItem value="SUPER_ADMIN">
                                  SUPER_ADMIN
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-700 dark:text-purple-400">
                              {user.role === "SUPER_ADMIN"
                                ? "S.ADMIN"
                                : user.role}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        {canEditUser(user) ? (
                          <Select
                            value={user.status}
                            onValueChange={(value) =>
                              handleEditUser(user.id, "status", value)
                            }
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="suspended">
                                Suspended
                              </SelectItem>
                              <SelectItem value="banned">Banned</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                : user.status === "suspended"
                                ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                                : "bg-red-500/20 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {user.status}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        <span className="text-muted-foreground text-sm">
                          {user.lastActive
                            ? new Date(user.lastActive).toLocaleDateString()
                            : "Never"}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleUserClick(user.id)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </DropdownMenuItem>

                            {/* Delete Action - Only show for users that can be deleted */}
                            {canDeleteUser(user) && (
                              <DropdownMenuItem
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Are you sure you want to delete ${user.username}? This action cannot be undone.`
                                    )
                                  ) {
                                    handleDeleteUser(user.id);
                                  }
                                }}
                                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            )}

                            {/* Info messages for restricted actions */}
                            {!canEditUser(user) &&
                              user.id !== currentUser?.id && (
                                <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
                                  {currentUser?.role === "ADMIN" &&
                                  user.role === "SUPER_ADMIN"
                                    ? "Cannot edit SUPER_ADMIN users"
                                    : "No edit permissions"}
                                </div>
                              )}

                            {user.id === currentUser?.id && (
                              <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
                                Cannot edit/delete yourself
                              </div>
                            )}

                            {currentUser?.role === "ADMIN" && (
                              <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
                                Only SUPER_ADMIN can delete users
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg font-medium mb-2">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "No users found matching your criteria"
                    : "No users found"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Users will appear here when they are added"}
                </p>
                {(searchTerm ||
                  roleFilter !== "all" ||
                  statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    className="mt-2"
                  >
                    Clear Search & Filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-muted/10 border-t">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;

// -----------------------------------------------------------------------------------------

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState, useMemo, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAppDispatch, useAppSelector } from "../hooks/redux";
// import {
//   deleteUserById,
//   fetchAllUsers,
//   searchUsers,
//   setPagination,
//   updateUserRoleStatus,
//   setUsers,
// } from "../features/user/user.slice";
// import { Pagination } from "../components/general/Pagination";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../components/ui/table";
// import { Button } from "../components/ui/button";
// import { Input } from "../components/ui/input";
// import { Loader } from "../components/general/Loader";
// import { getFullImageUrl } from "../utils/imageUtils";
// import {
//   Users as UsersIcon,
//   Eye,
//   Crown,
//   Shield,
//   User,
//   Trash2,
//   MoreVertical,
//   Search,
//   X,
//   Filter,
//   SortAsc,
//   SortDesc,
//   RefreshCw,
//   Clock,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../components/ui/dropdown-menu";
// import { toast } from "sonner";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../components/ui/select";
// import { useDebounce } from "../hooks/useDebounce";

// // Cache configuration
// const CACHE_CONFIG = {
//   USERS_LIST_TTL: 5 * 60 * 1000, // 5 minutes
//   SEARCH_CACHE_TTL: 3 * 60 * 1000, // 3 minutes
//   USER_PROFILE_TTL: 10 * 60 * 1000, // 10 minutes
//   STATS_CACHE_TTL: 2 * 60 * 1000, // 2 minutes
// };

// // Cache keys
// const CACHE_KEYS = {
//   USERS_LIST: (page: number, limit: number) => `users_list_${page}_${limit}`,
//   SEARCH_RESULTS: (query: string) => `search_${query}`,
//   USER_STATS: "user_stats",
//   LAST_FETCH: "last_fetch_timestamp",
// };

// // In-memory cache for client-side optimization
// const clientCache = new Map<
//   string,
//   { data: any; timestamp: number; ttl: number }
// >();

// // Cache utility functions
// const getCacheKey = (key: string): string => `redis_cache_${key}`;

// const setCache = (
//   key: string,
//   data: any,
//   ttl: number = CACHE_CONFIG.USERS_LIST_TTL
// ) => {
//   const cacheKey = getCacheKey(key);
//   clientCache.set(cacheKey, {
//     data,
//     timestamp: Date.now(),
//     ttl,
//   });
// };

// const getCache = (key: string): any | null => {
//   const cacheKey = getCacheKey(key);
//   const cached = clientCache.get(cacheKey);

//   if (!cached) return null;

//   const now = Date.now();
//   if (now - cached.timestamp > cached.ttl) {
//     clientCache.delete(cacheKey);
//     return null;
//   }

//   return cached.data;
// };

// const invalidateCache = (pattern?: string) => {
//   if (pattern) {
//     const keysToDelete = Array.from(clientCache.keys()).filter((key) =>
//       key.includes(pattern)
//     );
//     keysToDelete.forEach((key) => clientCache.delete(key));
//   } else {
//     clientCache.clear();
//   }
// };

// const Users = () => {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const { currentUser, users, loading, pagination, error } = useAppSelector(
//     (state) => state.user
//   );

//   // Search and filter states
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [sortBy, setSortBy] = useState("username");
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [lastCacheUpdate, setLastCacheUpdate] = useState<Date | null>(null);

//   // Debounced search term
//   const debouncedSearchTerm = useDebounce(searchTerm, 500);

//   // Memoized cache keys
//   const usersCacheKey = useMemo(
//     () => CACHE_KEYS.USERS_LIST(pagination.currentPage, pagination.limit),
//     [pagination.currentPage, pagination.limit]
//   );

//   const searchCacheKey = useMemo(
//     () =>
//       debouncedSearchTerm
//         ? CACHE_KEYS.SEARCH_RESULTS(debouncedSearchTerm)
//         : null,
//     [debouncedSearchTerm]
//   );

//   // Enhanced fetch function with caching
//   const fetchUsersWithCache = useCallback(
//     async (forceRefresh = false) => {
//       const cacheKey = usersCacheKey;

//       if (!forceRefresh) {
//         const cachedData = getCache(cacheKey);
//         if (cachedData) {
//           dispatch(setUsers(cachedData.users));
//           setLastCacheUpdate(new Date(cachedData.timestamp));
//           return;
//         }
//       }

//       try {
//         setIsRefreshing(true);
//         const result = await dispatch(
//           fetchAllUsers({
//             page: pagination.currentPage,
//             limit: pagination.limit,
//           })
//         ).unwrap();

//         // Cache the result
//         setCache(cacheKey, {
//           users: result.users,
//           timestamp: Date.now(),
//           pagination: {
//             currentPage: result.page,
//             totalPages: result.totalPages,
//             totalUsers: result.total,
//           },
//         });

//         setLastCacheUpdate(new Date());

//         // Also cache user stats
//         const stats = calculateUserStats(result.users);
//         setCache(CACHE_KEYS.USER_STATS, stats, CACHE_CONFIG.STATS_CACHE_TTL);
//       } catch (error) {
//         console.error("Failed to fetch users:", error);
//         toast.error("Failed to fetch users");
//       } finally {
//         setIsRefreshing(false);
//       }
//     },
//     [dispatch, pagination.currentPage, pagination.limit, usersCacheKey]
//   );

//   // Enhanced search function with caching
//   const searchUsersWithCache = useCallback(
//     async (query: string, forceRefresh = false) => {
//       if (!query.trim()) {
//         await fetchUsersWithCache(forceRefresh);
//         return;
//       }

//       const cacheKey = CACHE_KEYS.SEARCH_RESULTS(query);

//       if (!forceRefresh) {
//         const cachedData = getCache(cacheKey);
//         if (cachedData) {
//           dispatch(setUsers(cachedData.users));
//           setLastCacheUpdate(new Date(cachedData.timestamp));
//           return;
//         }
//       }

//       try {
//         setIsRefreshing(true);
//         const result = await dispatch(searchUsers(query)).unwrap();

//         // Cache the search result
//         setCache(
//           cacheKey,
//           {
//             users: result.users,
//             timestamp: Date.now(),
//             total: result.total,
//           },
//           CACHE_CONFIG.SEARCH_CACHE_TTL
//         );

//         setLastCacheUpdate(new Date());
//       } catch (error) {
//         console.error("Search failed:", error);
//         toast.error("Search failed");
//       } finally {
//         setIsRefreshing(false);
//       }
//     },
//     [dispatch, fetchUsersWithCache]
//   );

//   // Calculate user stats
//   const calculateUserStats = (usersList: any[]) => {
//     const activeUsers = usersList.filter((u) => u.status === "active").length;
//     const adminUsers = usersList.filter(
//       (u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN"
//     ).length;

//     return {
//       totalUsers: usersList.length,
//       activeUsers,
//       adminUsers,
//     };
//   };

//   // Effect for handling search and normal user fetching
//   useEffect(() => {
//     if (debouncedSearchTerm) {
//       searchUsersWithCache(debouncedSearchTerm);
//     } else {
//       fetchUsersWithCache();
//     }
//   }, [debouncedSearchTerm, searchUsersWithCache, fetchUsersWithCache]);

//   // Filtered and sorted users with caching
//   const filteredUsers = useMemo(() => {
//     let filtered = [...users];

//     // Apply role filter
//     if (roleFilter !== "all") {
//       filtered = filtered.filter((user) => user.role === roleFilter);
//     }

//     // Apply status filter
//     if (statusFilter !== "all") {
//       filtered = filtered.filter((user) => user.status === statusFilter);
//     }

//     // Apply sorting
//     filtered.sort((a, b) => {
//       let aValue: any;
//       let bValue: any;

//       switch (sortBy) {
//         case "username":
//           aValue = a.username.toLowerCase();
//           bValue = b.username.toLowerCase();
//           break;
//         case "email":
//           aValue = a.email.toLowerCase();
//           bValue = b.email.toLowerCase();
//           break;
//         case "role":
//           aValue = a.role;
//           bValue = b.role;
//           break;
//         case "status":
//           aValue = a.status;
//           bValue = b.status;
//           break;
//         case "lastActive":
//           aValue = a.lastActive ? new Date(a.lastActive).getTime() : 0;
//           bValue = b.lastActive ? new Date(b.lastActive).getTime() : 0;
//           break;
//         default:
//           aValue = a.username.toLowerCase();
//           bValue = b.username.toLowerCase();
//       }

//       if (sortOrder === "asc") {
//         return aValue > bValue ? 1 : -1;
//       } else {
//         return aValue < bValue ? 1 : -1;
//       }
//     });

//     return filtered;
//   }, [users, roleFilter, statusFilter, sortBy, sortOrder]);

//   // Statistics based on filtered users
//   const filteredStats = useMemo(() => {
//     const stats = calculateUserStats(filteredUsers);
//     return stats;
//   }, [filteredUsers]);

//   // Enhanced page change handler
//   const handlePageChange = useCallback(
//     (page: number) => {
//       dispatch(setPagination({ currentPage: page }));
//       // Invalidate current page cache to force fresh data
//       invalidateCache(`users_list_${page}_`);
//     },
//     [dispatch]
//   );

//   const handleUserClick = useCallback(
//     (userId: string) => {
//       navigate(`/users/${userId}`);
//     },
//     [navigate]
//   );

//   // Enhanced clear function
//   const clearSearch = useCallback(() => {
//     setSearchTerm("");
//     setRoleFilter("all");
//     setStatusFilter("all");
//     setSortBy("username");
//     setSortOrder("asc");

//     // Clear search cache
//     invalidateCache("search_");

//     // Refetch users
//     fetchUsersWithCache(true);
//   }, [fetchUsersWithCache]);

//   const handleSort = useCallback(
//     (field: string) => {
//       if (sortBy === field) {
//         setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//       } else {
//         setSortBy(field);
//         setSortOrder("asc");
//       }
//     },
//     [sortBy, sortOrder]
//   );

//   // Enhanced refresh handler
//   const handleRefresh = useCallback(() => {
//     invalidateCache(); // Clear all cache
//     if (debouncedSearchTerm) {
//       searchUsersWithCache(debouncedSearchTerm, true);
//     } else {
//       fetchUsersWithCache(true);
//     }
//   }, [debouncedSearchTerm, searchUsersWithCache, fetchUsersWithCache]);

//   // Helper function to check if current user can edit a target user
//   const canEditUser = useCallback(
//     (targetUser: any) => {
//       if (!currentUser) return false;
//       if (targetUser.id === currentUser.id) return false;
//       if (currentUser.role === "SUPER_ADMIN") return true;
//       if (currentUser.role === "ADMIN") {
//         return targetUser.role === "USER";
//       }
//       return false;
//     },
//     [currentUser]
//   );

//   // Helper function to check if current user can delete a target user
//   const canDeleteUser = useCallback(
//     (targetUser: any) => {
//       if (!currentUser) return false;
//       if (targetUser.id === currentUser.id) return false;
//       if (currentUser.role === "SUPER_ADMIN") return true;
//       return false;
//     },
//     [currentUser]
//   );

//   // Enhanced edit user handler
//   const handleEditUser = useCallback(
//     async (userId: string, field: "role" | "status", value: string) => {
//       const targetUser = users.find((user) => user.id === userId);
//       if (!targetUser) {
//         toast.error("User not found");
//         return;
//       }

//       if (!canEditUser(targetUser)) {
//         toast.error("You don't have permission to edit this user");
//         return;
//       }

//       if (field === "role" && currentUser?.role === "ADMIN") {
//         toast.error("Admins cannot change user roles");
//         return;
//       }

//       try {
//         const updates = { id: userId, [field]: value };
//         await dispatch(updateUserRoleStatus(updates)).unwrap();

//         // Invalidate relevant caches
//         invalidateCache("users_list_");
//         invalidateCache("search_");
//         invalidateCache(CACHE_KEYS.USER_STATS);

//         toast.success("User updated successfully");
//       } catch (error: any) {
//         toast.error(error.message || "Failed to update user");
//       }
//     },
//     [users, canEditUser, currentUser, dispatch]
//   );

//   // Enhanced delete user handler
//   const handleDeleteUser = useCallback(
//     async (userId: string) => {
//       const targetUser = users.find((user) => user.id === userId);
//       if (!targetUser) {
//         toast.error("User not found");
//         return;
//       }

//       if (!canDeleteUser(targetUser)) {
//         toast.error("You don't have permission to delete this user");
//         return;
//       }

//       try {
//         await dispatch(deleteUserById(userId)).unwrap();

//         // Invalidate relevant caches
//         invalidateCache("users_list_");
//         invalidateCache("search_");
//         invalidateCache(CACHE_KEYS.USER_STATS);

//         toast.success("User deleted successfully");
//       } catch (error: any) {
//         toast.error(error.message || "Failed to delete user");
//       }
//     },
//     [users, canDeleteUser, dispatch]
//   );

//   const getRoleIcon = (role: string) => {
//     switch (role) {
//       case "SUPER_ADMIN":
//         return <Crown className="h-3 w-3" />;
//       case "ADMIN":
//         return <Shield className="h-3 w-3" />;
//       default:
//         return <User className="h-3 w-3" />;
//     }
//   };

//   const truncateText = (text: string, maxLength: number) => {
//     if (text.length <= maxLength) return text;
//     return text.substring(0, maxLength) + "...";
//   };

//   const formatLastCacheUpdate = (date: Date | null) => {
//     if (!date) return "Never";
//     const now = new Date();
//     const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

//     if (diffInMinutes < 1) return "Just now";
//     if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

//     const diffInHours = Math.floor(diffInMinutes / 60);
//     if (diffInHours < 24) return `${diffInHours}h ago`;

//     return date.toLocaleDateString();
//   };

//   if (loading && !users.length) {
//     return (
//       <div className="min-h-screen bg-hero">
//         <div className="container mx-auto px-4 py-8">
//           <div className="flex items-center justify-center h-64">
//             <div className="text-center">
//               <Loader size="small" />
//               <p className="mt-4 text-muted-foreground">Loading users...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-hero">
//         <div className="container mx-auto px-4 py-8">
//           <div className="flex items-center justify-center h-64">
//             <div className="text-center p-8 bg-card-gradient rounded-xl shadow-soft border">
//               <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <UsersIcon className="h-6 w-6 text-red-600" />
//               </div>
//               <p className="text-red-500 font-medium">{error}</p>
//               <Button
//                 onClick={() => window.location.reload()}
//                 className="mt-4 bg-primary-gradient hover:shadow-orange"
//               >
//                 Try Again
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-hero">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header Section */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-2">
//             <div className="flex items-center gap-3">
//               <div className="h-10 w-10 bg-primary-gradient rounded-xl flex items-center justify-center shadow-orange">
//                 <UsersIcon className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl lg:text-3xl font-bold text-primary">
//                   Users Management
//                 </h1>
//                 <p className="text-muted-foreground">
//                   Manage and monitor all users in your system
//                 </p>
//               </div>
//             </div>

//             {/* Cache status and refresh button */}
//             <div className="flex items-center gap-3">
//               <div className="text-right">
//                 <p className="text-xs text-muted-foreground flex items-center gap-1">
//                   <Clock className="h-3 w-3" />
//                   Last updated: {formatLastCacheUpdate(lastCacheUpdate)}
//                 </p>
//               </div>
//               <Button
//                 onClick={handleRefresh}
//                 disabled={isRefreshing}
//                 variant="outline"
//                 size="sm"
//                 className="flex items-center gap-2"
//               >
//                 <RefreshCw
//                   className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
//                 />
//                 {isRefreshing ? "Refreshing..." : "Refresh"}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filters Section */}
//         <div className="mb-8">
//           <div className="bg-card-gradient rounded-xl border shadow-soft p-6">
//             <div className="flex flex-col lg:flex-row gap-4">
//               {/* Search Bar */}
//               <div className="flex-1 relative">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     placeholder="Search users by name, email, or role..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10 pr-10 h-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
//                   />
//                   {searchTerm && (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/90 hover:text-gray-700"
//                       onClick={() => setSearchTerm("")}
//                     >
//                       <X className="h-3 w-3" />
//                     </Button>
//                   )}
//                 </div>
//               </div>

//               {/* Filters */}
//               <div className="flex flex-wrap gap-3">
//                 <div className="flex items-center gap-2">
//                   <Filter className="h-4 w-4 text-muted-foreground" />
//                   <Select value={roleFilter} onValueChange={setRoleFilter}>
//                     <SelectTrigger className="w-[140px] h-10">
//                       <SelectValue placeholder="Role" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Roles</SelectItem>
//                       <SelectItem value="USER">User</SelectItem>
//                       <SelectItem value="ADMIN">Admin</SelectItem>
//                       <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <Select value={statusFilter} onValueChange={setStatusFilter}>
//                   <SelectTrigger className="w-[140px] h-10">
//                     <SelectValue placeholder="Status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Status</SelectItem>
//                     <SelectItem value="active">Active</SelectItem>
//                     <SelectItem value="inactive">Inactive</SelectItem>
//                     <SelectItem value="suspended">Suspended</SelectItem>
//                     <SelectItem value="banned">Banned</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <Select value={sortBy} onValueChange={setSortBy}>
//                   <SelectTrigger className="w-[140px] h-10">
//                     <SelectValue placeholder="Sort By" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="username">Username</SelectItem>
//                     <SelectItem value="email">Email</SelectItem>
//                     <SelectItem value="role">Role</SelectItem>
//                     <SelectItem value="status">Status</SelectItem>
//                     <SelectItem value="lastActive">Last Active</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() =>
//                     setSortOrder(sortOrder === "asc" ? "desc" : "asc")
//                   }
//                   className="h-10 px-3"
//                 >
//                   {sortOrder === "asc" ? (
//                     <SortAsc className="h-4 w-4" />
//                   ) : (
//                     <SortDesc className="h-4 w-4" />
//                   )}
//                 </Button>

//                 {(searchTerm ||
//                   roleFilter !== "all" ||
//                   statusFilter !== "all") && (
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={clearSearch}
//                     className="h-10 px-3 text-muted-foreground hover:text-foreground"
//                   >
//                     Clear All
//                   </Button>
//                 )}
//               </div>
//             </div>

//             {/* Search Results Info */}
//             {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
//               <div className="mt-4 pt-4 border-t border-border/50">
//                 <div className="flex items-center justify-between text-sm text-muted-foreground">
//                   <span>
//                     Showing {filteredUsers.length} of {users.length} users
//                     {searchTerm && ` matching "${searchTerm}"`}
//                   </span>
//                   {filteredUsers.length > 0 && (
//                     <span>
//                       {filteredStats.activeUsers} active •{" "}
//                       {filteredStats.adminUsers} admins
//                     </span>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <div className="bg-card-gradient rounded-xl p-4 border shadow-soft hover-lift">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   {searchTerm || roleFilter !== "all" || statusFilter !== "all"
//                     ? "Filtered"
//                     : "Total"}{" "}
//                   Users
//                 </p>
//                 <p className="text-2xl font-bold text-primary">
//                   {filteredStats.totalUsers}
//                 </p>
//               </div>
//               <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
//                 <UsersIcon className="h-4 w-4 text-primary" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-card-gradient rounded-xl p-4 border shadow-soft hover-lift">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Active Users</p>
//                 <p className="text-2xl font-bold text-green-600">
//                   {filteredStats.activeUsers}
//                 </p>
//               </div>
//               <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
//                 <div className="h-2 w-2 bg-green-600 rounded-full"></div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-card-gradient rounded-xl p-4 border shadow-soft hover-lift">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Admins</p>
//                 <p className="text-2xl font-bold text-purple-600">
//                   {filteredStats.adminUsers}
//                 </p>
//               </div>
//               <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
//                 <Crown className="h-4 w-4 text-purple-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-card-gradient rounded-xl p-4 border shadow-soft hover-lift">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Page</p>
//                 <p className="text-2xl font-bold text-primary">
//                   {pagination.currentPage} of {pagination.totalPages}
//                 </p>
//               </div>
//               <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
//                 <span className="text-xs font-bold text-primary">
//                   {pagination.currentPage}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Users Table */}
//         <div className="bg-card-gradient rounded-xl shadow-soft border overflow-hidden">
//           <div className="p-6">
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h2 className="text-xl font-semibold text-foreground">
//                   {searchTerm || roleFilter !== "all" || statusFilter !== "all"
//                     ? "Search Results"
//                     : "All Users"}
//                 </h2>
//                 <p className="text-sm text-muted-foreground">
//                   {filteredUsers.length} users displayed
//                 </p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-muted-foreground">
//                   Showing {(pagination.currentPage - 1) * pagination.limit + 1}{" "}
//                   to{" "}
//                   {Math.min(
//                     pagination.currentPage * pagination.limit,
//                     pagination.totalUsers
//                   )}{" "}
//                   of {pagination.totalUsers}
//                 </span>
//               </div>
//             </div>

//             <div className="overflow-x-auto custom-scrollbar">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="border-border/50 hover:bg-muted/30">
//                     <TableHead
//                       className="text-foreground font-semibold cursor-pointer hover:bg-muted/20"
//                       onClick={() => handleSort("username")}
//                     >
//                       <div className="flex items-center gap-2">
//                         User
//                         {sortBy === "username" &&
//                           (sortOrder === "asc" ? (
//                             <SortAsc className="h-3 w-3" />
//                           ) : (
//                             <SortDesc className="h-3 w-3" />
//                           ))}
//                       </div>
//                     </TableHead>
//                     <TableHead
//                       className="text-foreground font-semibold hidden md:table-cell cursor-pointer hover:bg-muted/20"
//                       onClick={() => handleSort("email")}
//                     >
//                       <div className="flex items-center gap-2">
//                         Email
//                         {sortBy === "email" &&
//                           (sortOrder === "asc" ? (
//                             <SortAsc className="h-3 w-3" />
//                           ) : (
//                             <SortDesc className="h-3 w-3" />
//                           ))}
//                       </div>
//                     </TableHead>
//                     <TableHead
//                       className="text-foreground font-semibold cursor-pointer hover:bg-muted/20"
//                       onClick={() => handleSort("role")}
//                     >
//                       <div className="flex items-center gap-2">
//                         Role
//                         {sortBy === "role" &&
//                           (sortOrder === "asc" ? (
//                             <SortAsc className="h-3 w-3" />
//                           ) : (
//                             <SortDesc className="h-3 w-3" />
//                           ))}
//                       </div>
//                     </TableHead>
//                     <TableHead
//                       className="text-foreground font-semibold hidden sm:table-cell cursor-pointer hover:bg-muted/20"
//                       onClick={() => handleSort("status")}
//                     >
//                       <div className="flex items-center gap-2">
//                         Status
//                         {sortBy === "status" &&
//                           (sortOrder === "asc" ? (
//                             <SortAsc className="h-3 w-3" />
//                           ) : (
//                             <SortDesc className="h-3 w-3" />
//                           ))}
//                       </div>
//                     </TableHead>
//                     <TableHead
//                       className="text-foreground font-semibold hidden lg:table-cell cursor-pointer hover:bg-muted/20"
//                       onClick={() => handleSort("lastActive")}
//                     >
//                       <div className="flex items-center gap-2">
//                         Last Active
//                         {sortBy === "lastActive" &&
//                           (sortOrder === "asc" ? (
//                             <SortAsc className="h-3 w-3" />
//                           ) : (
//                             <SortDesc className="h-3 w-3" />
//                           ))}
//                       </div>
//                     </TableHead>
//                     <TableHead className="text-foreground font-semibold w-20">
//                       Actions
//                     </TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredUsers.length === 0 ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={6}
//                         className="text-center py-12 text-muted-foreground"
//                       >
//                         <div className="flex flex-col items-center gap-3">
//                           <div className="h-12 w-12 bg-muted/20 rounded-full flex items-center justify-center">
//                             <UsersIcon className="h-6 w-6 text-muted-foreground" />
//                           </div>
//                           <div>
//                             <p className="font-medium">No users found</p>
//                             <p className="text-sm">
//                               {searchTerm ||
//                               roleFilter !== "all" ||
//                               statusFilter !== "all"
//                                 ? "Try adjusting your search criteria"
//                                 : "There are no users to display"}
//                             </p>
//                           </div>
//                           {(searchTerm ||
//                             roleFilter !== "all" ||
//                             statusFilter !== "all") && (
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={clearSearch}
//                               className="mt-2"
//                             >
//                               Clear Filters
//                             </Button>
//                           )}
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     filteredUsers.map((user) => (
//                       <TableRow
//                         key={user.id}
//                         className="border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
//                         onClick={() => handleUserClick(user.id)}
//                       >
//                         <TableCell className="py-4">
//                           <div className="flex items-center gap-3">
//                             <div className="relative">
//                               <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
//                                 {user.avatar ? (
//                                   <img
//                                     src={getFullImageUrl(user.avatar)}
//                                     alt={user.username}
//                                     className="h-full w-full object-cover"
//                                     onError={(e) => {
//                                       const target =
//                                         e.target as HTMLImageElement;
//                                       target.style.display = "none";
//                                       target.nextElementSibling?.classList.remove(
//                                         "hidden"
//                                       );
//                                     }}
//                                   />
//                                 ) : null}
//                                 <span
//                                   className={`text-sm font-medium text-primary ${
//                                     user.avatar ? "hidden" : ""
//                                   }`}
//                                 >
//                                   {user.username.charAt(0).toUpperCase()}
//                                 </span>
//                               </div>
//                               <div
//                                 className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${
//                                   user.status === "active"
//                                     ? "bg-green-500"
//                                     : user.status === "inactive"
//                                     ? "bg-gray-400"
//                                     : user.status === "suspended"
//                                     ? "bg-yellow-500"
//                                     : "bg-red-500"
//                                 }`}
//                               />
//                             </div>
//                             <div className="min-w-0 flex-1">
//                               <p className="font-medium text-foreground truncate">
//                                 {user.username}
//                               </p>
//                               <p className="text-sm text-muted-foreground md:hidden truncate">
//                                 {user.email}
//                               </p>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell className="hidden md:table-cell py-4">
//                           <div className="max-w-[200px]">
//                             <p className="text-sm text-foreground truncate">
//                               {user.email}
//                             </p>
//                           </div>
//                         </TableCell>
//                         <TableCell className="py-4">
//                           <div className="flex items-center gap-2">
//                             <div
//                               className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
//                                 user.role === "SUPER_ADMIN"
//                                   ? "bg-purple-100 text-purple-800"
//                                   : user.role === "ADMIN"
//                                   ? "bg-blue-100 text-blue-800"
//                                   : "bg-gray-100 text-gray-800"
//                               }`}
//                             >
//                               {getRoleIcon(user.role)}
//                               <span className="hidden sm:inline">
//                                 {user.role === "SUPER_ADMIN"
//                                   ? "Super Admin"
//                                   : user.role === "ADMIN"
//                                   ? "Admin"
//                                   : "User"}
//                               </span>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell className="hidden sm:table-cell py-4">
//                           <div
//                             className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
//                               user.status === "active"
//                                 ? "bg-green-100 text-green-800"
//                                 : user.status === "inactive"
//                                 ? "bg-gray-100 text-gray-800"
//                                 : user.status === "suspended"
//                                 ? "bg-yellow-100 text-yellow-800"
//                                 : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             <div
//                               className={`h-1.5 w-1.5 rounded-full ${
//                                 user.status === "active"
//                                   ? "bg-green-500"
//                                   : user.status === "inactive"
//                                   ? "bg-gray-400"
//                                   : user.status === "suspended"
//                                   ? "bg-yellow-500"
//                                   : "bg-red-500"
//                               }`}
//                             />
//                             <span className="capitalize">{user.status}</span>
//                           </div>
//                         </TableCell>
//                         <TableCell className="hidden lg:table-cell py-4">
//                           <div className="text-sm">
//                             {user.lastActive ? (
//                               <div>
//                                 <p className="text-foreground">
//                                   {new Date(
//                                     user.lastActive
//                                   ).toLocaleDateString()}
//                                 </p>
//                                 <p className="text-muted-foreground">
//                                   {new Date(user.lastActive).toLocaleTimeString(
//                                     [],
//                                     {
//                                       hour: "2-digit",
//                                       minute: "2-digit",
//                                     }
//                                   )}
//                                 </p>
//                               </div>
//                             ) : (
//                               <span className="text-muted-foreground">
//                                 Never
//                               </span>
//                             )}
//                           </div>
//                         </TableCell>
//                         <TableCell className="py-4">
//                           <div className="flex items-center gap-1">
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleUserClick(user.id);
//                               }}
//                               className="h-8 w-8 p-0 hover:bg-primary/10"
//                             >
//                               <Eye className="h-4 w-4" />
//                             </Button>

//                             {(canEditUser(user) || canDeleteUser(user)) && (
//                               <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                   <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={(e) => e.stopPropagation()}
//                                     className="h-8 w-8 p-0 hover:bg-muted/90"
//                                   >
//                                     <MoreVertical className="h-4 w-4" />
//                                   </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent
//                                   align="end"
//                                   className="w-48"
//                                 >
//                                   {canEditUser(user) && (
//                                     <>
//                                       {currentUser?.role === "SUPER_ADMIN" && (
//                                         <>
//                                           <DropdownMenuItem
//                                             onClick={(e) => {
//                                               e.stopPropagation();
//                                               handleEditUser(
//                                                 user.id,
//                                                 "role",
//                                                 user.role === "USER"
//                                                   ? "ADMIN"
//                                                   : "USER"
//                                               );
//                                             }}
//                                           >
//                                             <Shield className="h-4 w-4 mr-2" />
//                                             {user.role === "USER"
//                                               ? "Make Admin"
//                                               : "Make User"}
//                                           </DropdownMenuItem>
//                                         </>
//                                       )}
//                                       <DropdownMenuItem
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           handleEditUser(
//                                             user.id,
//                                             "status",
//                                             user.status === "active"
//                                               ? "inactive"
//                                               : "active"
//                                           );
//                                         }}
//                                       >
//                                         <div
//                                           className={`h-4 w-4 mr-2 rounded-full ${
//                                             user.status === "active"
//                                               ? "bg-gray-400"
//                                               : "bg-green-500"
//                                           }`}
//                                         />
//                                         {user.status === "active"
//                                           ? "Deactivate"
//                                           : "Activate"}
//                                       </DropdownMenuItem>
//                                       {user.status !== "suspended" && (
//                                         <DropdownMenuItem
//                                           onClick={(e) => {
//                                             e.stopPropagation();
//                                             handleEditUser(
//                                               user.id,
//                                               "status",
//                                               "suspended"
//                                             );
//                                           }}
//                                         >
//                                           <div className="h-4 w-4 mr-2 rounded-full bg-yellow-500" />
//                                           Suspend
//                                         </DropdownMenuItem>
//                                       )}
//                                       {user.status !== "banned" && (
//                                         <DropdownMenuItem
//                                           onClick={(e) => {
//                                             e.stopPropagation();
//                                             handleEditUser(
//                                               user.id,
//                                               "status",
//                                               "banned"
//                                             );
//                                           }}
//                                         >
//                                           <div className="h-4 w-4 mr-2 rounded-full bg-red-500" />
//                                           Ban
//                                         </DropdownMenuItem>
//                                       )}
//                                     </>
//                                   )}
//                                   {canDeleteUser(user) && (
//                                     <>
//                                       <DropdownMenuItem
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           if (
//                                             window.confirm(
//                                               `Are you sure you want to delete ${user.username}? This action cannot be undone.`
//                                             )
//                                           ) {
//                                             handleDeleteUser(user.id);
//                                           }
//                                         }}
//                                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
//                                       >
//                                         <Trash2 className="h-4 w-4 mr-2" />
//                                         Delete User
//                                       </DropdownMenuItem>
//                                     </>
//                                   )}
//                                 </DropdownMenuContent>
//                               </DropdownMenu>
//                             )}
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>
//         </div>

//         {/* Pagination */}
//         {!debouncedSearchTerm && filteredUsers.length > 0 && (
//           <div className="mt-8 flex justify-center">
//             <Pagination
//               currentPage={pagination.currentPage}
//               totalPages={pagination.totalPages}
//               onPageChange={handlePageChange}
//               showFirstLast={true}
//               maxPagesToShow={5}
//             />
//           </div>
//         )}

//         {/* Loading overlay for refresh */}
//         {isRefreshing && (
//           <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
//             <div className="bg-card-gradient rounded-xl p-6 shadow-lg border">
//               <div className="flex items-center gap-3">
//                 <Loader size="small" />
//                 <span className="text-foreground">Refreshing users...</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Users;
