export interface FirebaseUploadOptions {
  bucketName?: string;
  makePublic?: boolean;
  pathStructure?: string;
  contentType?: string;
  metadata?: Record<string, any>;
}

export interface IStorageService {
  uploadFile(
    fileData: Buffer,
    originalName: string,
    options?: FirebaseUploadOptions
  ): Promise<{
    url: string;
    filePath: string;
    bucketName: string;
  }>;

  deleteFile(filePath: string, bucketName?: string): Promise<void>;
}
