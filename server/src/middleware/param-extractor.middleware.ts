import { NextFunction, Request, Response } from "express";

// Middleware to extract route parameters from URL when they're missing from req.params
export const paramExtractorMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.params).length === 0 && req.originalUrl.includes("/")) {
      const routePattern = req.route?.path;

      if (routePattern && routePattern.includes(":")) {
        const patternSegments = routePattern.split("/").filter(Boolean);
        const urlSegments = req.originalUrl.split("/").filter(Boolean);

        const apiPrefixCount = req.baseUrl.split("/").filter(Boolean).length;
        const relevantUrlSegments = urlSegments.slice(apiPrefixCount);

        patternSegments.forEach((segment: string, index: number) => {
          if (segment.startsWith(":") && relevantUrlSegments[index]) {
            const paramName = segment.substring(1);
            req.params[paramName] = relevantUrlSegments[index];
          }
        });
      } else {
        const pathSegments = req.originalUrl.split("/");
        const lastSegment = pathSegments[pathSegments.length - 1];

        if (/^[a-f0-9]{24}$/i.test(lastSegment)) {
          req.params.id = lastSegment;
        }
      }
    }

    if ((req as any).context && Object.keys(req.params).length > 0) {
      (req as any).context.params = {
        ...(req as any).context.params,
        ...req.params,
      };
    }

    next();
  };
};
