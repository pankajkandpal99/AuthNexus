import { z } from "zod";

export const fileValidator = z
  .object({
    fieldname: z.string(),
    filename: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number(),
    destination: z.string(),
    path: z.string(),
    originalFilename: z.string().optional(),
  })
  .passthrough();
