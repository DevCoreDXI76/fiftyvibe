import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const outDir = "out";

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (extname(entry) === ".html") files.push(full);
  }
  return files;
}

const htmlFiles = walk(outDir);
const hrefRegex = /href="(\/[^"]*)"/g;
const brokenLinks = [];
const checkedPages = new Set();

function resolveExists(path) {
  // strip query/hash
  const clean = path.split("#")[0].split("?")[0];
  if (clean === "/") return existsSync(join(outDir, "index.html"));
  const trimmed = clean.replace(/\/$/, "");
  // static asset (has a file extension) -> check literal file
  if (extname(trimmed)) {
    return existsSync(join(outDir, trimmed));
  }
  const candidates = [
    join(outDir, trimmed + ".html"),
    join(outDir, trimmed, "index.html"),
  ];
  return candidates.some((c) => existsSync(c));
}

for (const file of htmlFiles) {
  const content = readFileSync(file, "utf-8");
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith("//")) continue; // protocol-relative external
    if (href.startsWith("/_next")) continue;
    if (!resolveExists(href)) {
      brokenLinks.push({ file, href });
    }
    checkedPages.add(href.split("#")[0].split("?")[0]);
  }
}

console.log(`검사한 HTML 파일 수: ${htmlFiles.length}`);
console.log(`발견된 고유 내부 링크 수: ${checkedPages.size}`);
if (process.argv.includes("--list")) {
  console.log([...checkedPages].sort().join("\n"));
}
if (brokenLinks.length === 0) {
  console.log("✅ 깨진 내부 링크 없음");
} else {
  console.log(`❌ 깨진 링크 ${brokenLinks.length}건:`);
  for (const b of brokenLinks) {
    console.log(`  ${b.file} -> ${b.href}`);
  }
  process.exit(1);
}
