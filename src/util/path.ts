import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

export const __filename = fileURLToPath(import.meta.url);

export const __dirname = path.resolve(path.dirname(__filename), "..");

export const isDev = __filename.includes(`${path.sep}src${path.sep}`);

export function toFileUrl(file: string): string {
    return pathToFileURL(file).href;
}