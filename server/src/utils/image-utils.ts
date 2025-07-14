// import { env } from "../config/env.js";
// import { FileInfo } from "../types/file-upload-types.js";

// export type ImageInput = FileInfo | string;

// export const ImageUtils = {
//   // Process image paths by normalizing URLs and handling mixed content (files and strings)
//   processImageUrls(images: ImageInput[]): string[] {
//     if (!images || !Array.isArray(images)) return [];

//     return images.map((image) => {
//       // If it's a file object, return the path
//       if (typeof image !== "string") {
//         return image.path.replace(/^.*\/uploads\//, "/uploads/");
//       }

//       return this.normalizeImageUrl(image);
//     });
//   },

//   // Normalize an image URL by removing the base URL part
//   normalizeImageUrl(imageUrl: string): string {
//     if (!imageUrl) return "";
//     const baseUrl = env.BASE_URL || "http://localhost:8800";

//     // Remove the base URL from the image path
//     return imageUrl.replace(
//       new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
//       ""
//     );
//   },
// };
