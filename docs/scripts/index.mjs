import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..', 'docs');
const IGNORE = new Set(['node_modules', '.git', 'dist']);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let currentObj = null;
  let inBlock = false;
  for (const line of lines) {
    // Detect indented sub-object (2+ spaces before key)
    const indentMatch = line.match(/^(\s{2,})(\S+):\s*(.*)/);
    const topMatch = line.match(/^(\S+):\s*(.*)/);
    
    if (indentMatch && currentObj !== null) {
      // Sub-key of current object
      const subKey = indentMatch[2];
      let subVal = indentMatch[3].trim();
      try { subVal = JSON.parse(subVal); } catch {}
      currentObj[subKey] = subVal;
    } else if (topMatch) {
      const key = topMatch[1];
      let val = topMatch[2].trim();
      // Check if this starts a sub-object (next lines are indented)
      currentKey = key;
      if (val === '') {
        currentObj = {};
        meta[key] = currentObj;
      } else {
        try { val = JSON.parse(val); } catch {}
        meta[key] = val;
        currentObj = null;
      }
    }
  }
  return meta;
}

function calcMmi(meta) {
  const m = meta.mmi;
  if (!m || typeof m.l1 === 'undefined') return null;
  const l1 = m.l1 || 0, l2 = m.l2 || 0, l3 = m.l3 || 0, l4 = m.l4 || 0;
  const max = 4; // Each layer has 4 criteria
  const total = l1 + l2 + l3 + l4;
  const maxTotal = max * 4;
  const score = Math.round((total / maxTotal) * 100);
  const status = score >= 80 ? 'PRODUCTION' : score >= 60 ? 'STABLE' : score >= 40 ? 'DEVELOPMENT' : score >= 20 ? 'EARLY' : 'PLANNED';
  return { l1, l2, l3, l4, score, status, verified: m.verified || false };
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

// Get git info
let gitCommit = 'unknown';
try { gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim(); } catch {}

const now = new Date();
const generatedAt = now.toISOString();
const files = scanDir(ROOT);
const index = [];
const mmiModules = [];

let mdIndex = '# SEARCH INDEX — AION Knowledge & Engineering System\n\n';
mdIndex += `**Generated:** ${generatedAt.slice(0, 10)}\n\n`;
mdIndex += '| ID | Title | Path | Status | MMI | Tags |\n';
mdIndex += '|----|-------|------|--------|-----|------|\n';

for (const file of files.sort()) {
  const content = readFileSync(file, 'utf-8');
  const meta = parseFrontmatter(content);
  const firstLine = content.split('\n')[0]?.replace(/^#\s*/, '').slice(0, 80) || '(no title)';
  const rel = relative(ROOT, file);
  const id = meta.id || rel.replace(/\.md$/, '').replace(/\//g, '.');
  const tags = Array.isArray(meta.tags) ? meta.tags.join(', ') : '';
  const status = meta.status || '—';
  const mmi = calcMmi(meta);
  const mmiStr = mmi ? `${mmi.score}%` : '—';

  const entry = {
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
    mmi,
  };
  
  // Add to module score list if it's a module doc (no duplicates)
  if (mmi && rel.startsWith('03_MODULES') && !mmiModules.find(m => m.id === id.replace('module.', ''))) {
    mmiModules.push({ id: id.replace('module.', ''), ...mmi });
  }

  index.push(entry);
  mdIndex += `| ${id} | ${(meta.title || firstLine).slice(0, 45)} | ${rel} | ${status} | ${mmiStr} | ${tags.slice(0, 40)} |\n`;
}

// Compute stale docs (no review in 3 months)
const staleThreshold = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
const staleCount = index.filter(d => d.last_reviewed && new Date(d.last_reviewed) < staleThreshold).length;

// Add index metadata
const indexMeta = {
  _meta: {
    generated_at: generatedAt,
    git_commit: gitCommit,
    index_version: '1.0',
    docs_count: index.length,
    stale_docs_count: staleCount,
    mmi_modules: mmiModules,
    platform_mmi: mmiModules.length > 0
      ? Math.round(mmiModules.reduce((s, m) => s + m.score, 0) / mmiModules.length)
      : null,
  },
  entries: index,
};

// Write JSON index
writeFileSync(join(ROOT, '00_INDEX', 'SEARCH_INDEX.md'), mdIndex);
writeFileSync(join(__dirname, '..', '..', 'src', 'assets', 'documentation.db.json'), JSON.stringify(indexMeta, null, 2));
console.log(`Indexed ${index.length} files → documentation.db.json + SEARCH_INDEX.md`);
console.log(`MMI modules: ${mmiModules.map(m => `${m.id}=${m.score}%`).join(', ')}`);
console.log(`Git: ${gitCommit} | Generated: ${generatedAt.slice(0, 10)} | Stale: ${staleCount}`);
