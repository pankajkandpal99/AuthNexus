import { Op } from "sequelize";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from "../../../error-handler/index.js";
import { RequestContext } from "../../../middleware/context.js";
import { User } from "../../../models/user.model.js";
import { HttpResponse } from "../../../utils/service-response.js";

export const UserController = {
  getCurrentUser: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (session) => {
        const user = await User.findOne({
          where: { id: context.user?.id },
          attributes: { exclude: ["password", "refreshToken"] },
        });

        if (!user) {
          throw new NotFoundError("User not found");
        }

        return user;
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const { body, files, user } = context;

        if (!user?.id) {
          throw new AuthenticationError("You are not authenticated");
        }

        const existingUser = await User.findByPk(user?.id, { transaction });
        if (!existingUser) {
          throw new NotFoundError("User not found");
        }

        const updateData: any = {};

        if (body.username) {
          const usernameExists = await User.findOne({
            where: {
              username: body.username,
              id: { [Op.ne]: user?.id }, // Not the current user
            },
            transaction,
          });

          if (usernameExists) {
            throw new ConflictError("Username already taken");
          }

          updateData.username = body.username;
        }

        if (files && files.length > 0) {
          const profileImage = files[0];
          updateData.profileImage = profileImage.publicUrl;
        }

        await existingUser.update(updateData, { transaction });
        return existingUser.toSafeObject();
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  },

  getAllUsers: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const page = parseInt(context.query?.page as string) || 1;
        const limit = parseInt(context.query?.limit as string) || 10;
        const offset = (page - 1) * limit;

        if (!context.user?.id) {
          throw new AuthenticationError("Authentication required");
        }

        const { count, rows } = await User.findAndCountAll({
          where: {
            id: {
              [Op.ne]: context.user?.id,
            },
          },
          attributes: { exclude: ["password", "refreshToken"] },
          limit: limit,
          offset: offset,
          order: [["createdAt", "DESC"]],
          transaction,
        });

        return {
          users: rows.map((user) => user.toSafeObject()),
          total: count,
          page: page,
          totalPages: Math.ceil(count / limit),
        };
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error) {
      console.error("Get all users error:", error);
      throw error;
    }
  },

  getUserById: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const { id } = context.params;
        const user = await User.findByPk(id, {
          attributes: { exclude: ["password", "refreshToken"] },
          transaction,
        });

        if (!user) {
          throw new NotFoundError("User not found");
        }

        return user.toSafeObject();
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error) {
      console.error("Get user by ID error:", error);
      throw error;
    }
  },

  updateUser: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const { id, role, status } = context.body;

        if (!context.user?.id) {
          throw new AuthenticationError("Authentication required");
        }

        // Only SUPER_ADMIN can change roles
        if (role && context.user.role !== "SUPER_ADMIN") {
          throw new AuthenticationError("Only SUPER_ADMIN can change roles");
        }

        const user = await User.findByPk(id, { transaction });
        if (!user) {
          throw new NotFoundError("User not found");
        }

        // Prevent modifying yourself
        if (user.id === context.user.id) {
          throw new AuthenticationError("Cannot modify your own account");
        }

        // Prevent ADMIN from modifying SUPER_ADMIN
        if (context.user.role === "ADMIN" && user.role === "SUPER_ADMIN") {
          throw new AuthenticationError("ADMIN cannot modify SUPER_ADMIN");
        }

        const updateData: Partial<InstanceType<typeof User>> = {};
        if (status) updateData.status = status;
        if (role) updateData.role = role;

        await user.update(updateData, { transaction });
        return user.toSafeObject();
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  },

  deleteUser: async (context: RequestContext) => {
    try {
      const result = await context.withTransaction(async (transaction) => {
        const { id } = context.params;

        if (!context.user?.id) {
          throw new AuthenticationError("Authentication required");
        }

        // Only SUPER_ADMIN can delete users
        if (context.user.role !== "SUPER_ADMIN") {
          throw new AuthenticationError("Only SUPER_ADMIN can delete users");
        }

        const user = await User.findByPk(id, { transaction });
        if (!user) {
          throw new NotFoundError("User not found");
        }

        // Prevent deleting yourself
        if (user.id === context.user.id) {
          throw new AuthenticationError("Cannot delete your own account");
        }

        await user.destroy({ transaction });
        return { success: true, message: "User deleted successfully" };
      });

      return HttpResponse.send(context.res, result, 200);
    } catch (error) {
      console.error("Delete user error:", error);
      throw error;
    }
  },
};

// -----------------------------------------------------------------------------------------------

// import { Op } from "sequelize";
// import {
//   AuthenticationError,
//   ConflictError,
//   NotFoundError,
// } from "../../../error-handler/index.js";
// import { RequestContext } from "../../../middleware/context.js";
// import { User } from "../../../models/user.model.js";
// import { HttpResponse } from "../../../utils/service-response.js";
// import { redisService } from "../../../services/redis.service.js";

// export const UserController = {
//   getCurrentUser: async (context: RequestContext) => {
//     try {
//       const result = await context.withTransaction(async (session) => {
//         // Try to get from Redis cache first
//         const cachedUser = await redisService.getCachedUser(
//           context.user?.id || ""
//         );
//         if (cachedUser) {
//           return cachedUser;
//         }

//         const user = await User.findOne({
//           where: { id: context.user?.id },
//           attributes: { exclude: ["password", "refreshToken"] },
//         });

//         if (!user) {
//           throw new NotFoundError("User not found");
//         }

//         const userObj = user.toSafeObject();

//         // Cache the user data
//         await redisService.cacheUser(user.id, userObj, 3600); // 1 hour cache
//         // Index user for search
//         await redisService.indexUserForSearch(userObj);

//         return userObj;
//       });

//       return HttpResponse.send(context.res, result, 200);
//     } catch (error) {
//       throw error;
//     }
//   },

//   updateProfile: async (context: RequestContext) => {
//     try {
//       const result = await context.withTransaction(async (transaction) => {
//         const { body, files, user } = context;

//         if (!user?.id) {
//           throw new AuthenticationError("You are not authenticated");
//         }

//         const existingUser = await User.findByPk(user?.id, { transaction });
//         if (!existingUser) {
//           throw new NotFoundError("User not found");
//         }

//         const updateData: any = {};

//         if (body.username) {
//           const usernameExists = await User.findOne({
//             where: {
//               username: body.username,
//               id: { [Op.ne]: user?.id },
//             },
//             transaction,
//           });

//           if (usernameExists) {
//             throw new ConflictError("Username already taken");
//           }

//           updateData.username = body.username;
//         }

//         if (files && files.length > 0) {
//           const profileImage = files[0];
//           updateData.profileImage = profileImage.publicUrl;
//         }

//         await existingUser.update(updateData, { transaction });
//         const updatedUser = existingUser.toSafeObject();

//         // Update cache and search index
//         await redisService.cacheUser(user?.id, updatedUser, 3600);
//         await redisService.indexUserForSearch(updatedUser);

//         return updatedUser;
//       });

//       return HttpResponse.send(context.res, result, 200);
//     } catch (error) {
//       console.error("Profile update error:", error);
//       throw error;
//     }
//   },

//   getAllUsers: async (context: RequestContext) => {
//     try {
//       const result = await context.withTransaction(async (transaction) => {
//         const page = parseInt(context.query?.page as string) || 1;
//         const limit = parseInt(context.query?.limit as string) || 10;
//         const offset = (page - 1) * limit;

//         if (!context.user?.id) {
//           throw new AuthenticationError("Authentication required");
//         }

//         // Check cache first
//         const cacheKey = `users:page:${page}:limit:${limit}:excludeId:${context.user?.id}`;
//         const cachedUsers = await redisService.get(cacheKey);
//         if (cachedUsers) {
//           return cachedUsers;
//         }

//         const { count, rows } = await User.findAndCountAll({
//           where: {
//             id: {
//               [Op.ne]: context.user?.id,
//             },
//           },
//           attributes: { exclude: ["password", "refreshToken"] },
//           limit: limit,
//           offset: offset,
//           order: [["createdAt", "DESC"]],
//           transaction,
//         });

//         const result = {
//           users: rows.map((user) => user.toSafeObject()),
//           total: count,
//           page: page,
//           totalPages: Math.ceil(count / limit),
//         };

//         // Cache for 5 minutes
//         await redisService.set(cacheKey, result, 300);

//         // Index all users for search (in background)
//         Promise.all(
//           rows.map(async (user) => {
//             const userObj = user.toSafeObject();
//             await redisService.indexUserForSearch(userObj);
//           })
//         ).catch((err) => console.error("Error indexing users:", err));

//         return result;
//       });

//       return HttpResponse.send(context.res, result, 200);
//     } catch (error) {
//       console.error("Get all users error:", error);
//       throw error;
//     }
//   },

//   getUserById: async (context: RequestContext) => {
//     try {
//       const result = await context.withTransaction(async (transaction) => {
//         const { id } = context.params;

//         // Try cache first
//         const cachedUser = await redisService.getCachedUser(id);
//         if (cachedUser) {
//           return cachedUser;
//         }

//         const user = await User.findByPk(id, {
//           attributes: { exclude: ["password", "refreshToken"] },
//           transaction,
//         });

//         if (!user) {
//           throw new NotFoundError("User not found");
//         }

//         const userObj = user.toSafeObject();

//         // Cache the user and index for search
//         await redisService.cacheUser(id, userObj, 3600);
//         await redisService.indexUserForSearch(userObj);

//         return userObj;
//       });

//       return HttpResponse.send(context.res, result, 200);
//     } catch (error) {
//       console.error("Get user by ID error:", error);
//       throw error;
//     }
//   },

//   searchUsers: async (context: RequestContext) => {
//     try {
//       const result = await context.withTransaction(async (transaction) => {
//         const { query } = context.params;

//         if (!query || typeof query !== "string") {
//           throw new Error("Search query is required");
//         }

//         if (!context.user?.id) {
//           throw new AuthenticationError("Authentication required");
//         }

//         // Check Redis cache first
//         const cachedResults = await redisService.searchUsers(query);
//         if (cachedResults.length > 0) {
//           return cachedResults;
//         }

//         // Fallback to database search if Redis doesn't have results
//         const users = await User.findAll({
//           where: {
//             [Op.and]: [
//               {
//                 id: {
//                   [Op.ne]: context.user?.id,
//                 },
//               },
//               {
//                 [Op.or]: [
//                   {
//                     username: {
//                       [Op.iLike]: `%${query}%`,
//                     },
//                   },
//                   {
//                     email: {
//                       [Op.iLike]: `%${query}%`,
//                     },
//                   },
//                 ],
//               },
//             ],
//           },
//           attributes: { exclude: ["password", "refreshToken"] },
//           limit: 20,
//           transaction,
//         });

//         const userObjects = users.map((user) => user.toSafeObject());

//         // Cache the search results in Redis
//         await Promise.all(
//           userObjects.map((userObj) => redisService.indexUserForSearch(userObj))
//         );

//         return userObjects;
//       });

//       return HttpResponse.send(context.res, result, 200);
//     } catch (error) {
//       console.error("Search users error:", error);
//       throw error;
//     }
//   },

//   updateUser: async (context: RequestContext) => {
//     try {
//       const result = await context.withTransaction(async (transaction) => {
//         const { id, role, status } = context.body;

//         if (!context.user?.id) {
//           throw new AuthenticationError("Authentication required");
//         }

//         if (role && context.user.role !== "SUPER_ADMIN") {
//           throw new AuthenticationError("Only SUPER_ADMIN can change roles");
//         }

//         const user = await User.findByPk(id, { transaction });
//         if (!user) {
//           throw new NotFoundError("User not found");
//         }

//         if (user.id === context.user.id) {
//           throw new AuthenticationError("Cannot modify your own account");
//         }

//         if (context.user.role === "ADMIN" && user.role === "SUPER_ADMIN") {
//           throw new AuthenticationError("ADMIN cannot modify SUPER_ADMIN");
//         }

//         const updateData: Partial<InstanceType<typeof User>> = {};
//         if (status) updateData.status = status;
//         if (role) updateData.role = role;

//         await user.update(updateData, { transaction });
//         const updatedUser = user.toSafeObject();

//         // Update cache and search index
//         await redisService.cacheUser(id, updatedUser, 3600);
//         await redisService.indexUserForSearch(updatedUser);

//         return updatedUser;
//       });

//       return HttpResponse.send(context.res, result, 200);
//     } catch (error) {
//       console.error("Update user error:", error);
//       throw error;
//     }
//   },

//   deleteUser: async (context: RequestContext) => {
//     try {
//       const result = await context.withTransaction(async (transaction) => {
//         const { id } = context.params;

//         if (!context.user?.id) {
//           throw new AuthenticationError("Authentication required");
//         }

//         if (context.user.role !== "SUPER_ADMIN") {
//           throw new AuthenticationError("Only SUPER_ADMIN can delete users");
//         }

//         const user = await User.findByPk(id, { transaction });
//         if (!user) {
//           throw new NotFoundError("User not found");
//         }

//         if (user.id === context.user.id) {
//           throw new AuthenticationError("Cannot delete your own account");
//         }

//         await user.destroy({ transaction });

//         // Clear cache and search index
//         await redisService.clearUserCache(id, user.username, user.email);
//         await redisService.clearUserFromSearch(id, user.username, user.email);

//         return { success: true, message: "User deleted successfully" };
//       });

//       return HttpResponse.send(context.res, result, 200);
//     } catch (error) {
//       console.error("Delete user error:", error);
//       throw error;
//     }
//   },
// };
