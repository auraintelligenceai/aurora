
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function getA2uiPaths(env = process.env) {
  const srcDir =
    env.AURA_A2UI_SRC_DIR ?? path.join(repoRoot, "src", "canvas-host", "a2ui");
  const outDir =
    env.AURA_A2UI_OUT_DIR ?? path.join(repoRoot, "dist", "canvas-host", "a2ui");
  return { srcDir, outDir };
}

export async function copyA2uiAssets({
  srcDir,
  outDir,
}: {
  srcDir: string;
  outDir: string;
}) {
  const skipMissing = process.env.AURA_A2UI_SKIP_MISSING === "1";
  try {
    await fs.stat(path.join(srcDir, "index.html"));
    await fs.stat(path.join(srcDir, "a2ui.bundle.js"));
  } catch (err) {
    const message =
      'Missing A2UI bundle assets. Run "pnpm canvas:a2ui:bundle" and retry.';
    if (skipMissing) {
      console.warn(`${message} Skipping copy (AURA_A2UI_SKIP_MISSING=1).`);
      return;
    }
    throw new Error(message, { cause: err });
  }
  await fs.mkdir(path.dirname(outDir), { recursive: true });
  await fs.cp(srcDir, outDir, { recursive: true });
}

async function main() {
  const { srcDir, outDir } = getA2uiPaths();
  await copyA2uiAssets({ srcDir, outDir });
  
  // Copy the avatar HTML file as well
  const avatarSrcPath = path.join(repoRoot, "src", "canvas-host", "aura-avatar.html");
  const avatarDestPath = path.join(repoRoot, "dist", "canvas-host", "aura-avatar.html");
  
  try {
    await fs.stat(avatarSrcPath);
    await fs.mkdir(path.dirname(avatarDestPath), { recursive: true });
    await fs.copyFile(avatarSrcPath, avatarDestPath);
    console.log("Copied aura-avatar.html to dist directory");
  } catch (err) {
    console.warn(`Failed to copy aura-avatar.html: ${err}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error(String(err));
    process.exit(1);
  });
}
