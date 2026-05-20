import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache");

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function getCached<T>(key: string, maxAgeMs: number): T | null {
  try {
    ensureCacheDir();
    const filePath = path.join(CACHE_DIR, `${key}.json`);

    if (!fs.existsSync(filePath)) return null;

    const stat = fs.statSync(filePath);
    const age = Date.now() - stat.mtimeMs;

    if (age > maxAgeMs) return null;

    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    ensureCacheDir();
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Cache write error:", error);
  }
}

export function clearCache(): void {
  try {
    ensureCacheDir();
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      if (file.endsWith(".json")) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
    }
  } catch (error) {
    console.error("Cache clear error:", error);
  }
}
