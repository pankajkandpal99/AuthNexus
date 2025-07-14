export interface FileInfo {
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  path: string;
  originalFilename?: string;
  publicUrl: string;
}

export interface UploadOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  destination?: string;
  pathStructure?: string;
}

export interface UploadResult {
  files: FileInfo[];
  fields: Record<string, any>;
}

// export interface FileInfo {
//   fieldname: string;
//   filename: string;
//   encoding: string;
//   mimetype: string;
//   size: number;
//   destination?: string;
//   path?: string;
//   originalFilename?: string;
//   publicUrl?: string;
//   cloudinaryId?: string;
//   resourceType?: string;
// }

// export interface UploadOptions {
//   maxFileSize?: number;
//   allowedMimeTypes?: string[];
//   destination?: string;
//   pathStructure?: string;
//   cloudinaryFolder?: string;
//   useCloudinary?: boolean;
// }

// export interface UploadResult {
//   files: FileInfo[];
//   fields: Record<string, any>;
// }
