import {
  FileUploadConfigKey,
  getFileUploadConfig,
} from "../config/file-upload-config.js";
import { ApiHandlerOptions } from "./api-factory.js";

export function withFileUpload(
  options: Partial<ApiHandlerOptions> = {},
  fieldName: string | string[] | FileUploadConfigKey,
  multipartOptions?: {
    convertTextToJson?: boolean;
    validateBeforeAuth?: boolean;
    pathStructure?: string;
    targetField?: string;
  }
): ApiHandlerOptions {
  const isConfigKey =
    typeof fieldName === "string" &&
    !fieldName.includes("-") &&
    !fieldName.includes("_");
  const configKey = isConfigKey
    ? (fieldName as FileUploadConfigKey)
    : undefined;
  const actualFields = isConfigKey
    ? undefined
    : typeof fieldName === "string"
      ? [fieldName]
      : fieldName;

  const fieldMapping =
    multipartOptions?.targetField && actualFields
      ? actualFields.map((field) => ({
          sourceField: field,
          targetField: multipartOptions.targetField ?? "",
          isArray: true,
        }))
      : undefined;

  return {
    ...options,
    fileUpload: {
      enabled: true,
      convertTextToJson: multipartOptions?.convertTextToJson ?? true,
      validateBeforeAuth: multipartOptions?.validateBeforeAuth ?? false,
      options: {
        ...getFileUploadConfig(configKey),
        ...(actualFields ? { allowedFields: actualFields } : {}),
        pathStructure: multipartOptions?.pathStructure,
      },
    },
  };
}

// import {
//   FileUploadConfigKey,
//   getFileUploadConfig,
// } from "../config/file-upload-config.js";
// import { ApiHandlerOptions } from "../utils/api-factory.js";

// export function withFileUpload(
//   options: Partial<ApiHandlerOptions> = {},
//   fieldName: string | string[] | FileUploadConfigKey,
//   multipartOptions?: {
//     convertTextToJson?: boolean;
//     validateBeforeAuth?: boolean;
//     pathStructure?: string;
//     useCloudinary?: boolean;
//     cloudinaryFolder?: string;
//     targetField?: string;
//   }
// ): ApiHandlerOptions {
//   const isConfigKey =
//     typeof fieldName === "string" &&
//     !fieldName.includes("-") &&
//     !fieldName.includes("_");
//   const configKey = isConfigKey
//     ? (fieldName as FileUploadConfigKey)
//     : undefined;
//   const actualFields = isConfigKey
//     ? undefined
//     : typeof fieldName === "string"
//       ? [fieldName]
//       : fieldName;

//   const fieldMapping =
//     multipartOptions?.targetField && actualFields
//       ? actualFields.map((field) => ({
//           sourceField: field,
//           targetField: multipartOptions.targetField ?? "",
//           isArray: true,
//         }))
//       : undefined;

//   return {
//     ...options,
//     fileUpload: {
//       enabled: true,
//       convertTextToJson: multipartOptions?.convertTextToJson ?? true,
//       validateBeforeAuth: multipartOptions?.validateBeforeAuth ?? false,
//       options: {
//         ...getFileUploadConfig(configKey),
//         ...(actualFields ? { allowedFields: actualFields } : {}),
//         pathStructure: multipartOptions?.pathStructure,
//         useCloudinary: multipartOptions?.useCloudinary ?? true,
//         cloudinaryFolder: multipartOptions?.cloudinaryFolder || "gamehigame",
//         ...(fieldMapping ? { fieldMapping } : {}),
//       },
//     },
//   };
// }
