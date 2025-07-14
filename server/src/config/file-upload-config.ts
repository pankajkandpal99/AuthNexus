import { EnhancedUploadOptions } from "../hooks/file-upload-hook.js";

export type BaseFileUploadConfigKey =
  | "profile-image"
  | "product-image"
  | "gallery-image"
  | "default";

export type FileUploadConfigKey = BaseFileUploadConfigKey | (string & {});

export const fileUploadConfigs: Record<
  FileUploadConfigKey,
  Partial<EnhancedUploadOptions>
> = {
  // "profile-image": {
  //   maxFileSize: 5 * 1024 * 1024, // 5MB
  //   allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  //   processImages: true,
  //   imageProcessingOptions: {
  //     sizes: [
  //       { width: 300, suffix: "lg", quality: 85 },
  //       { width: 150, suffix: "md", quality: 80 },
  //       { width: 50, suffix: "sm", quality: 75 },
  //     ],
  //     outputFormat: "webp",
  //     optimizeOriginal: true,
  //   },
  // },
  "profile-image": {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    processImages: true,
    imageProcessingOptions: {
      sizes: [
        { width: 300, suffix: "lg", quality: 85 },
        { width: 150, suffix: "md", quality: 80 },
        { width: 50, suffix: "sm", quality: 75 },
      ],
      outputFormat: "webp",
    },
  },
  "product-image": {
    maxFileSize: 8 * 1024 * 1024, // 8MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    processImages: true,
    imageProcessingOptions: {
      sizes: [
        { width: 1200, suffix: "xl", quality: 85 },
        { width: 800, suffix: "lg", quality: 80 },
        { width: 400, suffix: "md", quality: 75 },
        { width: 200, suffix: "sm", quality: 70 },
      ],
      outputFormat: "webp",
      optimizeOriginal: true,
    },
  },
  "gallery-image": {
    maxFileSize: 15 * 1024 * 1024, // 15MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    processImages: true,
    imageProcessingOptions: {
      sizes: [
        { width: 2000, suffix: "xl", quality: 90 },
        { width: 1200, suffix: "lg", quality: 85 },
        { width: 800, suffix: "md", quality: 80 },
        { width: 400, suffix: "sm", quality: 75 },
      ],
      outputFormat: "webp",
      optimizeOriginal: true,
    },
  },

  default: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    processImages: true,
    imageProcessingOptions: {
      sizes: [
        { width: 800, suffix: "lg", quality: 80 },
        { width: 400, suffix: "md", quality: 75 },
      ],
      outputFormat: "webp",
      optimizeOriginal: true,
    },
  },
};

export function getFileUploadConfig(
  configKey: FileUploadConfigKey | FileUploadConfigKey[] = "default"
): Partial<EnhancedUploadOptions> {
  if (Array.isArray(configKey)) {
    return configKey.reduce((mergedConfig, key) => {
      const config =
        fileUploadConfigs[key as BaseFileUploadConfigKey] ||
        fileUploadConfigs.default;
      return { ...mergedConfig, ...config };
    }, {});
  }

  return (
    fileUploadConfigs[configKey as BaseFileUploadConfigKey] ||
    fileUploadConfigs.default
  );
}
