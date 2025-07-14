import { FileInfo } from "../types/file-upload-types.js";
import fs from "fs";
import path from "path";

export interface StorageService {
  saveFile(buffer: Buffer, filename: string): Promise<FileInfo>;
  deleteFile(filepath: string): Promise<void>;
  getPublicUrl(filename: string): string;
}

export class LocalStorageService implements StorageService {
  private uploadDir: string;

  constructor(uploadDir: string = path.join(process.cwd(), "src", "uploads")) {
    this.uploadDir = uploadDir;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(buffer: Buffer, filename: string): Promise<FileInfo> {
    const filePath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return {
      fieldname: "file",
      filename,
      encoding: "7bit",
      mimetype: this.getMimeType(filename),
      size: buffer.length,
      destination: this.uploadDir,
      path: filePath,
      publicUrl: this.getPublicUrl(filename),
    };
  }

  async deleteFile(filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(filepath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getPublicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".png":
        return "image/png";
      case ".webp":
        return "image/webp";
      default:
        return "application/octet-stream";
    }
  }
}
