import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const file = fileURLToPath(import.meta.url);
const dir = path.dirname(file);

// If running from dist/, root is dist
// If running from src/, root is src
export const __dirname = dir.includes(`${path.sep}dist${path.sep}`)
    ? path.resolve(dir, "..")        // dist root
    : path.resolve(dir, "..");       // src root

export function toFileUrl(file: string): string {
    return pathToFileURL(file).href;
}
