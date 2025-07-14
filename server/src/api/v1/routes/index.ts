import { Router } from "express";
import { readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routesPath = __dirname;

const findRouteFiles = (dir: string): string[] => {
  const files = readdirSync(dir);
  let routeFiles: string[] = [];

  files.forEach((file) => {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      // If it's a directory, search recursively
      routeFiles = [...routeFiles, ...findRouteFiles(fullPath)];
    } // Modify this line
    else if (
      file.endsWith(
        process.env.NODE_ENV === "production" ? ".route.js" : ".route.ts"
      ) &&
      file !== "index.ts"
    ) {
      routeFiles.push(fullPath);
    }
  });

  return routeFiles;
};

const loadRoutes = async () => {
  const routeFiles = findRouteFiles(__dirname);

  for (const file of routeFiles) {
    try {
      const relativePath =
        "./" + file.replace(__dirname, "").replace(/\\/g, "/");
      const route = await import(/* @vite-ignore */ relativePath);

      if (typeof route.default === "function") {
        route.default(router);
        // console.log(`✓ Route loaded: ${relativePath}`);
      }
    } catch (error) {
      console.error(`✗ Failed to load route ${file}:`, error);
    }
  }
};

loadRoutes().catch((error) => {
  console.error("Route loading failed:", error);
  process.exit(1);
});

export default router;
