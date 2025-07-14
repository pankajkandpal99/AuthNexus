import { Router } from "express";
import { createApiHandler } from "../../../utils/api-factory.js";
import { UserController } from "../controllers/user.controller.js";
import { withFileUpload } from "../../../utils/file-upload-utils.js";
import { updateProfileSchema } from "../../../schema/authSchema.js";
import { requireSuperAdmin } from "@/middleware/super-admin-auth.js";

export default (router: Router) => {
  router.get(
    "/users/me",
    createApiHandler(UserController.getCurrentUser, {
      useTransaction: true,
      requireAuth: true,
    })
  );
  router.put(
    "/users/update/profile",
    createApiHandler(
      UserController.updateProfile,
      withFileUpload(
        {
          requireAuth: true,
          bodySchema: updateProfileSchema,
          useTransaction: true,
        },
        "file",
        {
          convertTextToJson: true,
          pathStructure: "/my-profile",
          targetField: "profileImage",
        }
      )
    )
  );

  router.get(
    "/users",
    createApiHandler(UserController.getAllUsers, {
      requireAuth: true,
      requireAdmin: true,
      useTransaction: true,
    })
  );

  router.get(
    "/user/:id",
    createApiHandler(UserController.getUserById, {
      requireAuth: true,
    })
  );

  router.put(
    "/user/update",
    createApiHandler(UserController.updateUser, {
      requireAuth: true,
      requireAdmin: true,
      useTransaction: true,
    })
  );

  router.delete(
    "/user/:id",
    createApiHandler(UserController.deleteUser, {
      requireAuth: true,
      requireSuperAdmin: true,
      useTransaction: true,
    })
  );
};

// ---------------------------------------------------------------------------------------
// import { Router } from "express";
// import { createApiHandler } from "../../../utils/api-factory.js";
// import { UserController } from "../controllers/user.controller.js";
// import { withFileUpload } from "../../../utils/file-upload-utils.js";
// import { updateProfileSchema } from "../../../schema/authSchema.js";
// import {
//   cacheMiddleware,
//   invalidateCache,
//   rateLimitMiddleware,
// } from "../../../middleware/redis.middleware.js";

// export default (router: Router) => {
//   router.get(
//     "/users/me",
//     rateLimitMiddleware(100, 3600), // 100 requests per hour
//     cacheMiddleware(3600), // Cache for 1 hour
//     createApiHandler(UserController.getCurrentUser, {
//       useTransaction: true,
//       requireAuth: true,
//     })
//   );

//   router.put(
//     "/users/update/profile",
//     rateLimitMiddleware(10, 3600), // 10 updates per hour
//     invalidateCache("users:*"),
//     createApiHandler(
//       UserController.updateProfile,
//       withFileUpload(
//         {
//           requireAuth: true,
//           bodySchema: updateProfileSchema,
//           useTransaction: true,
//         },
//         "file",
//         {
//           convertTextToJson: true,
//           pathStructure: "/my-profile",
//           targetField: "profileImage",
//         }
//       )
//     )
//   );

//   router.get(
//     "/users",
//     rateLimitMiddleware(50, 3600), // 50 requests per hour
//     cacheMiddleware(300), // Cache for 5 minutes
//     createApiHandler(UserController.getAllUsers, {
//       requireAuth: true,
//       requireAdmin: true,
//       useTransaction: true,
//     })
//   );

//   // router.get(
//   //   "/users/search",
//   //   rateLimitMiddleware(30, 3600), // 30 searches per hour
//   //   cacheMiddleware(600), // Cache for 10 minutes
//   //   createApiHandler(UserController.searchUsers, {
//   //     requireAuth: true,
//   //     useTransaction: true,
//   //   })
//   // );

//   router.get(
//     "/users/search",
//     rateLimitMiddleware(30, 3600), // 30 searches per hour
//     cacheMiddleware(600), // Cache for 10 minutes
//     createApiHandler(UserController.searchUsers, {
//       requireAuth: true,
//       useTransaction: true,
//     })
//   );

//   router.get(
//     "/user/:id",
//     rateLimitMiddleware(100, 3600),
//     cacheMiddleware(3600),
//     createApiHandler(UserController.getUserById, {
//       requireAuth: true,
//     })
//   );

//   router.put(
//     "/user/update",
//     rateLimitMiddleware(20, 3600), // 20 updates per hour
//     invalidateCache("users:*"),
//     createApiHandler(UserController.updateUser, {
//       requireAuth: true,
//       requireAdmin: true,
//       useTransaction: true,
//     })
//   );

//   router.delete(
//     "/user/:id",
//     rateLimitMiddleware(5, 3600), // 5 deletions per hour
//     invalidateCache("users:*"),
//     createApiHandler(UserController.deleteUser, {
//       requireAuth: true,
//       requireSuperAdmin: true,
//       useTransaction: true,
//     })
//   );
// };
