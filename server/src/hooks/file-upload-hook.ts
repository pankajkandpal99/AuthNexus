import { RequestContext } from "../middleware/context.js";
import { handleFileUpload } from "../lib/file-upload.js";
import { logger } from "../utils/logger.js";
import { UploadOptions } from "../types/file-upload-types.js";
import { ImageProcessingOptions } from "../services/image-processing.service.js";
import { LocalStorageService } from "../services/storage.service.js";

export interface EnhancedUploadOptions extends UploadOptions {
  processImages?: boolean;
  imageProcessingOptions?: ImageProcessingOptions;
  convertTextToJson?: boolean;
  preservePath?: boolean;

  fieldMapping?: {
    sourceField: string;
    targetField: string;
    isArray?: boolean;
    transformPath?: (filename: string) => string;
  }[];
  combineExistingFiles?: {
    existingFieldName: string;
    targetFieldName: string;
    newFileFieldName: string;
  }[];
}

export const FileUploadHooks = {
  async processFileUpload(
    context: RequestContext,
    options: Partial<EnhancedUploadOptions> = {}
  ): Promise<void> {
    if (!context.req.is("multipart/form-data")) return;

    try {
      const storageService = new LocalStorageService(options.destination);
      const { files, fields } = await handleFileUpload(context.req, {
        ...options,
        storageService,
      });

      context.files = files || [];
      context.imageVariants = [];

      let processedFields = { ...fields };

      if (options.convertTextToJson) {
        processedFields = this.convertFieldsToJson(fields);
      }

      context.body = {
        ...context.body,
        ...processedFields,
      };

      let filesByField: Record<string, any[]> = {};

      if (context.files && context.files.length > 0) {
        filesByField = context.files.reduce(
          (acc, file) => {
            if (!acc[file.fieldname]) {
              acc[file.fieldname] = [];
            }
            acc[file.fieldname].push(file);
            return acc;
          },
          {} as Record<string, any[]>
        );

        Object.keys(filesByField).forEach((fieldname) => {
          if (filesByField[fieldname].length === 1) {
            context.body[fieldname] = filesByField[fieldname][0];
          } else {
            context.body[fieldname] = filesByField[fieldname];
          }
        });
      }

      if (options.fieldMapping && options.fieldMapping.length > 0) {
        this.processFieldMappings(context, filesByField, options.fieldMapping);
      }

      if (
        options.combineExistingFiles &&
        options.combineExistingFiles.length > 0
      ) {
        this.processCombinedFiles(
          context,
          filesByField,
          processedFields,
          options.combineExistingFiles
        );
      }

      context.req.body = context.body;
    } catch (error) {
      logger.error("File upload processing failed:", error);
      throw error;
    }
  },

  processFieldMappings(
    context: RequestContext,
    filesByField: Record<string, any[]>,
    fieldMappings: EnhancedUploadOptions["fieldMapping"] = []
  ): void {
    fieldMappings.forEach((mapping) => {
      if (filesByField[mapping.sourceField]) {
        const transformPath =
          mapping.transformPath ||
          ((file: any) =>
            typeof file === "string"
              ? file
              : file.publicUrl || `/uploads/${file.filename}`);

        const mappedFiles = filesByField[mapping.sourceField].map((file) =>
          typeof file === "string" ? file : transformPath(file)
        );

        if (mapping.isArray) {
          context.body[mapping.targetField] = mappedFiles;
        } else if (mappedFiles.length === 1) {
          context.body[mapping.targetField] = mappedFiles[0];
        } else {
          context.body[mapping.targetField] = mappedFiles;
        }
      } else {
        // logger.debug(
        //   `Source field ${mapping.sourceField} not found in filesByField`
        // );
      }
    });
  },

  processCombinedFiles(
    context: RequestContext,
    filesByField: Record<string, any[]>,
    processedFields: Record<string, any>,
    combineOptions: EnhancedUploadOptions["combineExistingFiles"] = []
  ): void {
    combineOptions.forEach((option) => {
      try {
        let existingFiles = [];
        if (processedFields[option.existingFieldName]) {
          existingFiles = this.parseArrayField(
            processedFields[option.existingFieldName]
          );
        }

        const newFiles =
          filesByField[option.newFileFieldName]?.map(
            (file) => file.publicUrl || `/uploads/${file.filename}`
          ) || [];

        context.body[option.targetFieldName] = [...existingFiles, ...newFiles];
      } catch (error) {
        logger.error(
          `Error processing combined files for field ${option.targetFieldName}:`,
          error
        );
      }
    });
  },

  parseArrayField(field: any): any[] {
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return [field];
      }
    } else if (Array.isArray(field)) {
      return field;
    } else if (field) {
      return [field];
    }
    return [];
  },

  convertFieldsToJson(fields: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === "string") {
        try {
          if (
            (value.trim().startsWith("{") && value.trim().endsWith("}")) ||
            (value.trim().startsWith("[") && value.trim().endsWith("]"))
          ) {
            result[key] = JSON.parse(value);
            continue;
          }

          if (key.endsWith("[]")) {
            const baseKey = key.slice(0, -2);
            if (!result[baseKey]) {
              result[baseKey] = [];
            }
            result[baseKey].push(value);
            continue;
          }
        } catch (e: any) {
          // logger.debug(`Failed to parse field ${key} as JSON`, e);
          console.error(`Failed to parse field ${key} as JSON: ${e.message}`);
        }
      }

      result[key] = value;
    }

    return result;
  },
};

// import { RequestContext } from "../middleware/context.js";
// import { handleFileUpload } from "../lib/file-upload.js";
// import { logger } from "../utils/logger.js";
// import { UploadOptions } from "../types/file-upload-types.js";
// import { ImageProcessingOptions } from "../services/image-processing.service.js";

// export interface EnhancedUploadOptions extends UploadOptions {
//   processImages?: boolean;
//   imageProcessingOptions?: ImageProcessingOptions;
//   convertTextToJson?: boolean;
//   preservePath?: boolean;
//   useFirebase?: boolean;

//   fieldMapping?: {
//     sourceField: string;
//     targetField: string;
//     isArray?: boolean;
//     transformPath?: (filename: string) => string;
//   }[];
//   combineExistingFiles?: {
//     existingFieldName: string;
//     targetFieldName: string;
//     newFileFieldName: string;
//   }[];
// }

// export const FileUploadHooks = {
//   async processFileUpload(
//     context: RequestContext,
//     options: Partial<EnhancedUploadOptions> = {}
//   ): Promise<void> {
//     if (!context.req.is("multipart/form-data")) return;

//     try {
//       const { files, fields } = await handleFileUpload(context.req, options);

//       context.files = files || [];
//       context.imageVariants = [];

//       let processedFields = { ...fields };

//       if (options.convertTextToJson) {
//         processedFields = this.convertFieldsToJson(fields);
//       }

//       context.body = {
//         ...context.body,
//         ...processedFields,
//       };

//       let filesByField: Record<string, any[]> = {};

//       if (context.files && context.files.length > 0) {
//         filesByField = context.files.reduce(
//           (acc, file) => {
//             if (!acc[file.fieldname]) {
//               acc[file.fieldname] = [];
//             }
//             acc[file.fieldname].push(file);
//             return acc;
//           },
//           {} as Record<string, any[]>
//         );

//         Object.keys(filesByField).forEach((fieldname) => {
//           if (fieldname === "backgroundImages") {
//             context.body[fieldname] = filesByField[fieldname];
//           } else if (filesByField[fieldname].length === 1) {
//             context.body[fieldname] = filesByField[fieldname][0];
//           } else {
//             context.body[fieldname] = filesByField[fieldname];
//           }
//         });
//       }

//       if (options.fieldMapping && options.fieldMapping.length > 0) {
//         this.processFieldMappings(context, filesByField, options.fieldMapping);
//       }

//       if (
//         options.combineExistingFiles &&
//         options.combineExistingFiles.length > 0
//       ) {
//         this.processCombinedFiles(
//           context,
//           filesByField,
//           processedFields,
//           options.combineExistingFiles
//         );
//       }

//       context.req.body = context.body;
//     } catch (error) {
//       logger.error("File upload processing failed:", error);
//       throw error;
//     }
//   },

//   processFieldMappings(
//     context: RequestContext,
//     filesByField: Record<string, any[]>,
//     fieldMappings: EnhancedUploadOptions["fieldMapping"] = []
//   ): void {
//     fieldMappings.forEach((mapping) => {
//       if (filesByField[mapping.sourceField]) {
//         const transformPath =
//           mapping.transformPath ||
//           ((file: any) =>
//             typeof file === "string"
//               ? file
//               : file.publicUrl || `/uploads/${file.filename}`);

//         const mappedFiles = filesByField[mapping.sourceField].map((file) =>
//           typeof file === "string" ? file : transformPath(file)
//         );

//         if (mapping.isArray) {
//           context.body[mapping.targetField] = mappedFiles;
//         } else if (mappedFiles.length === 1) {
//           context.body[mapping.targetField] = mappedFiles[0];
//         } else {
//           context.body[mapping.targetField] = mappedFiles;
//         }
//       } else {
//         // logger.debug(
//         //   `Source field ${mapping.sourceField} not found in filesByField`
//         // );
//       }
//     });
//   },

//   processCombinedFiles(
//     context: RequestContext,
//     filesByField: Record<string, any[]>,
//     processedFields: Record<string, any>,
//     combineOptions: EnhancedUploadOptions["combineExistingFiles"] = []
//   ): void {
//     combineOptions.forEach((option) => {
//       try {
//         let existingFiles = [];
//         if (processedFields[option.existingFieldName]) {
//           existingFiles = this.parseArrayField(
//             processedFields[option.existingFieldName]
//           );
//         }

//         const newFiles =
//           filesByField[option.newFileFieldName]?.map(
//             (file) => file.publicUrl || `/uploads/${file.filename}`
//           ) || [];

//         context.body[option.targetFieldName] = [...existingFiles, ...newFiles];
//       } catch (error) {
//         logger.error(
//           `Error processing combined files for field ${option.targetFieldName}:`,
//           error
//         );
//       }
//     });
//   },

//   parseArrayField(field: any): any[] {
//     if (typeof field === "string") {
//       try {
//         const parsed = JSON.parse(field);
//         return Array.isArray(parsed) ? parsed : [parsed];
//       } catch (e) {
//         return [field];
//       }
//     } else if (Array.isArray(field)) {
//       return field;
//     } else if (field) {
//       return [field];
//     }
//     return [];
//   },

//   convertFieldsToJson(fields: Record<string, any>): Record<string, any> {
//     const result: Record<string, any> = {};

//     for (const [key, value] of Object.entries(fields)) {
//       if (typeof value === "string") {
//         try {
//           if (
//             (value.trim().startsWith("{") && value.trim().endsWith("}")) ||
//             (value.trim().startsWith("[") && value.trim().endsWith("]"))
//           ) {
//             result[key] = JSON.parse(value);
//             continue;
//           }

//           if (key.endsWith("[]")) {
//             const baseKey = key.slice(0, -2);
//             if (!result[baseKey]) {
//               result[baseKey] = [];
//             }
//             result[baseKey].push(value);
//             continue;
//           }
//         } catch (e: any) {
//           // logger.debug(`Failed to parse field ${key} as JSON`, e);
//           console.error(`Failed to parse field ${key} as JSON: ${e.message}`);
//         }
//       }

//       result[key] = value;
//     }

//     return result;
//   },
// };
