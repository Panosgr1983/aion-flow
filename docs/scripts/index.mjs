/**
 * AKES docs:index — Generate documentation.db.json + SEARCH_INDEX.md
 * Run: npm run docs:index
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..', 'docs');
const IGNORE = new Set(['node_modules', '.git', 'dist']);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split('\n')) {
    const sep = line.indexOf(': ');
    if (sep > 0) {
      const key = line.slice(0, sep).trim();
      const val = line.slice(sep + 2).trim();
      try { meta[key] = JSON.parse(val); } catch { meta[key] = val; }
    }
  }
  return meta;
}

function scanDir(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (IGNORE.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...scanDir(full));
    else if (entry.endsWith('.md')) files.push(full);
  }
  return files;
}

const files = scanDir(ROOT);
const index = [];
let mdIndex = '# SEARCH INDEX — AION Knowledge & Engineering System\n\n';
mdIndex += `**Generated:** ${new Date().toISOString().slice(0, 10)}\n\n`;
mdIndex += '| ID | Title | Path | Status | Tags |\n';
mdIndex += '|----|-------|------|--------|------|\n';

for (const file of files.sort()) {
  const content = readFileSync(file, 'utf-8');
  const meta = parseFrontmatter(content);
  const firstLine = content.split('\n')[0]?.replace(/^#\s*/, '').slice(0, 80) || '(no title)';
  const rel = relative(ROOT, file);
  const id = meta.id || rel.replace(/\.md$/, '').replace(/\//g, '.');
  const tags = Array.isArray(meta.tags) ? meta.tags.join(', ') : '';
  const status = meta.status || '—';

  index.push({
    id,
    title: meta.title || firstLine,
    path: rel,
    status,
    maturity: meta.maturity || '—',
    tags: meta.tags || [],
    owner: meta.owner || '—',
    last_reviewed: meta.last_reviewed || null,
    review_after: meta.review_after || null,
    depends: meta.depends || [],
    used_by: meta.used_by || [],
  });

  mdIndex += `| ${id} | ${(meta.title || firstLine).slice(0, 50)} | ${rel} | ${status} | ${tags.slice(0, 50)} |\n`;
}

// Write JSON index
writeFileSync(join(ROOT, '00_INDEX', 'SEARCH_INDEX.md'), mdIndex);
writeFileSync(join(__dirname, '..', '..', 'src', 'assets', 'documentation.db.json'), JSON.stringify(index, null, 2));
console.log(`Indexed ${index.length} files → documentation.db.json + SEARCH_INDEX.md`);
