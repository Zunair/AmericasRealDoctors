import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['assets/js', 'src', 'tests', 'scripts'];

function walk(dir) {
  const results = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
      continue;
    }

    if (fullPath.endsWith('.js') || fullPath.endsWith('.mjs')) {
      results.push(fullPath);
    }
  }

  return results;
}

const files = roots.flatMap((root) => walk(root));
const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failures.push(`${file}\n${result.stderr.trim()}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n\n'));
  process.exit(1);
}

console.log(`Lint check passed for ${files.length} files`);