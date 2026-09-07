/* Static check: find .map() renders whose top-level JSX element lacks a key.
   choice()-wrapped maps are handled separately (key flows into the button). */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("client", "src");
const walk = (d: string): string[] =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
    e.isDirectory()
      ? walk(path.join(d, e.name))
      : e.name.endsWith(".tsx")
        ? [path.join(d, e.name)]
        : []
  );

const suspicious: string[] = [];
for (const f of walk(ROOT)) {
  const src = fs.readFileSync(f, "utf8");
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!/\.map\(/.test(lines[i]!)) continue;
    // look at the next ~12 lines for the first JSX element
    const window = lines.slice(i, i + 12).join("\n");
    if (/choice\(/.test(window)) continue; // keyed inside the button
    const firstTag = window.match(/\.map\([^)]*=>\s*\(?\s*(<[A-Za-z][\w.]*)/);
    if (firstTag && !/key=/.test(firstTag[1]! + window.slice(window.indexOf(firstTag[1]!), window.indexOf(firstTag[1]!) + 160))) {
      suspicious.push(`${path.relative(ROOT, f)}:${i + 1} -> ${firstTag[1]}`);
    }
  }
}
console.log(suspicious.length ? suspicious.join("\n") : "OK: all mapped elements carry keys");
