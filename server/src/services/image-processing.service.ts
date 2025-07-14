import fs from "fs";
import path from "path";
import { FileInfo } from "../types/file-upload-types.js";
import { logger } from "../utils/logger.js";
import sharp from "sharp";

export interface ImageSize {
  width: number;
  height?: number;
  suffix: string;
  quality?: number;
}

export interface ImageProcessingOptions {
  sizes?: ImageSize[];
  optimizeOriginal?: boolean;
  deleteOriginal?: boolean;
  outputFormat?: "jpeg" | "png" | "webp";
  outputQuality?: number;
}

const DEFAULT_SIZES: ImageSize[] = [
  { width: 1920, suffix: "lg", quality: 85 },
  { width: 800, suffix: "md", quality: 80 },
  { width: 400, suffix: "sm", quality: 75 },
];

export const processImage = async (
  fileInfo: FileInfo,
  options: ImageProcessingOptions = {}
): Promise<{ original: FileInfo; variants: FileInfo[] }> => {
  const {
    sizes = DEFAULT_SIZES,
    optimizeOriginal = true,
    deleteOriginal = false,
    outputFormat,
    outputQuality = 85,
  } = options;

  if (!fileInfo.mimetype.startsWith("image/")) {
    logger.info(
      `File ${fileInfo.filename} is not an image, skipping processing`
    );
    return { original: fileInfo, variants: [] };
  }

  const originalPath = fileInfo.path;
  if (!originalPath) {
    throw new Error("Original path is undefined");
  }
  const fileDir = path.dirname(originalPath);
  const fileName = path.basename(originalPath, path.extname(originalPath));
  const fileExt = outputFormat
    ? `.${outputFormat}`
    : path.extname(originalPath);
  const variants: FileInfo[] = [];

  try {
    let imageProcessor = sharp(originalPath);
    const metadata = await imageProcessor.metadata();

    if (optimizeOriginal) {
      const optimizedPath = path.join(
        fileDir,
        `${fileName}-optimized${fileExt}`
      );

      if (outputFormat) {
        await imageProcessor[outputFormat]({ quality: outputQuality }).toFile(
          optimizedPath
        );
      } else if (fileExt === ".jpg" || fileExt === ".jpeg") {
        await imageProcessor
          .jpeg({ quality: outputQuality })
          .toFile(optimizedPath);
      } else if (fileExt === ".png") {
        await imageProcessor
          .png({ quality: outputQuality })
          .toFile(optimizedPath);
      } else if (fileExt === ".webp") {
        await imageProcessor
          .webp({ quality: outputQuality })
          .toFile(optimizedPath);
      } else {
        await imageProcessor.toFile(optimizedPath);
      }

      if (deleteOriginal) {
        if (originalPath) {
          fs.unlinkSync(originalPath);
        }
        fileInfo.path = optimizedPath;
        fileInfo.filename = path.basename(optimizedPath);

        if (outputFormat) {
          fileInfo.mimetype = `image/${outputFormat}`;
        }
      }
    }

    for (const size of sizes) {
      const variantPath = path.join(
        fileDir,
        `${fileName}-${size.suffix}${fileExt}`
      );

      imageProcessor = sharp(originalPath);

      if (size.height) {
        imageProcessor = imageProcessor.resize(size.width, size.height, {
          fit: "cover",
          position: "centre",
        });
      } else {
        imageProcessor = imageProcessor.resize(size.width, null, {
          withoutEnlargement: true,
        });
      }

      if (outputFormat) {
        imageProcessor = imageProcessor[outputFormat]({
          quality: size.quality || outputQuality,
        });
      } else if (fileExt === ".jpg" || fileExt === ".jpeg") {
        imageProcessor = imageProcessor.jpeg({
          quality: size.quality || outputQuality,
        });
      } else if (fileExt === ".png") {
        imageProcessor = imageProcessor.png({
          quality: size.quality || outputQuality,
        });
      } else if (fileExt === ".webp") {
        imageProcessor = imageProcessor.webp({
          quality: size.quality || outputQuality,
        });
      }

      await imageProcessor.toFile(variantPath);

      const variantInfo: FileInfo = {
        ...fileInfo,
        filename: path.basename(variantPath),
        path: variantPath,
        size: fs.statSync(variantPath).size,
        mimetype: outputFormat ? `image/${outputFormat}` : fileInfo.mimetype,
      };

      variants.push(variantInfo);
      // logger.info(`Created image variant: ${variantPath}`);
    }

    return { original: fileInfo, variants };
  } catch (error: any) {
    logger.error(`Error processing image ${fileInfo.filename}:`, error);
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

export const processMultipleImages = async (
  files: FileInfo[],
  options: ImageProcessingOptions = {}
): Promise<{ originals: FileInfo[]; variants: FileInfo[] }> => {
  const results = await Promise.all(
    files
      .filter((file) => file.mimetype.startsWith("image/"))
      .map((file) => processImage(file, options))
  );

  return {
    originals: results.map((result) => result.original),
    variants: results.flatMap((result) => result.variants),
  };
};
