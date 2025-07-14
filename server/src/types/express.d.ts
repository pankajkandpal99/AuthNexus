import { RequestContext } from "../middleware/context";
import { User } from "@prisma/client";

declare global {
  namespace Express {
    export interface Request {
      context: RequestContext;
      user?: User;
      files?: any;
      imageVariants?: any;
    }
  }
}
