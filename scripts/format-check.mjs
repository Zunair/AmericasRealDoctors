import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['assets', 'src', 'tests', 'pages'];
const allowed = new Set(['.js', '.css', '.html', '.md', '.xml', '.txt']);

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      results.push(...walk(full));
      continue;
    }
    const extension = full.slice(full.lastIndexOf('.'));
    if (allowed.has(extension)) results.push(full);
  }
  return results;
}

const files = roots.flatMap((root) => walk(root));
const issues = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  if (content.includes('\t')) issues.push(`${file}: contains tab characters`);
  if (/[ \t]+$/m.test(content)) issues.push(`${file}: contains trailing whitespace`);
}

if (issues.length > 0) {
  console.error(issues.join('\n'));
  process.exit(1);
}

console.log(`Format check passed for ${files.length} files`);
