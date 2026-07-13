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
  const stack = []; // [{ meta: parentObj, indent: number }]
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const indent = line.search(/\S/);
    const stripped = line.slice(indent);
    const isListItem = stripped.startsWith('- ');
    const isKeyValue = stripped.includes(':');
    
    // Pop stack to correct indent level
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    
    if (isListItem) {
      // Add to parent's list
      const value = stripped.slice(2).trim();
      const parent = stack[stack.length - 1];
      if (parent && Array.isArray(parent.meta)) {
        parent.meta.push(value);
      }
      continue;
    }
    
    if (isKeyValue) {
      const colonIdx = stripped.indexOf(':');
      const key = stripped.slice(0, colonIdx).trim();
      let val = stripped.slice(colonIdx + 1).trim();
      
      if (val === '') {
        // Peek ahead to see if children are list items or sub-keys
        const nextLine = lines[lines.indexOf(line) + 1];
        let isList = false;
        if (nextLine) {
          const nextIndent = nextLine.search(/\S/);
          const nextStripped = nextLine.slice(nextIndent);
          isList = nextStripped.startsWith('- ');
        }
        
        if (isList) {
          const list = [];
          if (stack.length === 0) {
            meta[key] = list;
          } else {
            const parent = stack[stack.length - 1].meta;
            parent[key] = list;
          }
          stack.push({ meta: list, indent });
        } else {
          const obj = {};
          if (stack.length === 0) {
            meta[key] = obj;
          } else {
            const parent = stack[stack.length - 1].meta;
            parent[key] = obj;
          }
          stack.push({ meta: obj, indent });
        }
      } else {
        try { val = JSON.parse(val); } catch {}
        if (stack.length === 0) {
          meta[key] = val;
        } else {
          const parent = stack[stack.length - 1].meta;
          parent[key] = val;
        }
      }
      continue;
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
    used_by: meta.used_by || [],
    relationships: meta.relationships || null,
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

// Build relationship map (graph)
const relationshipMap = { by_module: {}, by_tenant: {}, by_method: {}, by_playbook: {}, reusable_for: {} };
for (const entry of index) {
  if (!entry.relationships) continue;
  const r = entry.relationships;
  const moduleId = entry.id.replace('module.', '');
  // by_module: what this module uses and what uses it
  if (r.uses) {
    const mod = relationshipMap.by_module[moduleId] || {};
    mod.uses = r.uses;
    for (const dep of r.uses) {
      const depMod = relationshipMap.by_module[dep] || {};
      depMod.used_by = depMod.used_by || [];
      if (!depMod.used_by.includes(moduleId)) depMod.used_by.push(moduleId);
      relationshipMap.by_module[dep] = depMod;
    }
    relationshipMap.by_module[moduleId] = mod;
  }
  // by_tenant: tenants that use this module
  if (entry.used_by) {
      const usedBy = entry.used_by || [];
      for (const tenant of usedBy) {
      relationshipMap.by_tenant[tenant] = relationshipMap.by_tenant[tenant] || [];
      if (!relationshipMap.by_tenant[tenant].includes(moduleId)) {
        relationshipMap.by_tenant[tenant].push(moduleId);
      }
    }
  }
  // by_method: methods referenced by this module
  if (r.related_methods) {
    for (const method of r.related_methods) {
      relationshipMap.by_method[method] = relationshipMap.by_method[method] || [];
      if (!relationshipMap.by_method[method].includes(moduleId)) {
        relationshipMap.by_method[method].push(moduleId);
      }
    }
  }
  // by_playbook: playbooks referenced by this module
  if (r.related_playbooks) {
    for (const playbook of r.related_playbooks) {
      relationshipMap.by_playbook[playbook] = relationshipMap.by_playbook[playbook] || [];
      if (!relationshipMap.by_playbook[playbook].includes(moduleId)) {
        relationshipMap.by_playbook[playbook].push(moduleId);
      }
    }
  }
  // reusable_for: suggested industries
  if (r.reusable_for) {
    for (const industry of r.reusable_for) {
      relationshipMap.reusable_for[industry] = relationshipMap.reusable_for[industry] || [];
      if (!relationshipMap.reusable_for[industry].includes(moduleId)) {
        relationshipMap.reusable_for[industry].push(moduleId);
      }
    }
  }
}

// Add index metadata
const indexMeta = {
  _meta: {
    generated_at: generatedAt,
    git_commit: gitCommit,
    index_version: '1.1',
    docs_count: index.length,
    stale_docs_count: staleCount,
    mmi_modules: mmiModules,
    platform_mmi: mmiModules.length > 0
      ? Math.round(mmiModules.reduce((s, m) => s + m.score, 0) / mmiModules.length)
      : null,
    relationships: relationshipMap,
  },
  entries: index,
};

// Write JSON index
writeFileSync(join(ROOT, '00_INDEX', 'SEARCH_INDEX.md'), mdIndex);
writeFileSync(join(__dirname, '..', '..', 'src', 'assets', 'documentation.db.json'), JSON.stringify(indexMeta, null, 2));
console.log(`Indexed ${index.length} files → documentation.db.json + SEARCH_INDEX.md`);
console.log(`MMI modules: ${mmiModules.map(m => `${m.id}=${m.score}%`).join(', ')}`);
console.log(`Git: ${gitCommit} | Generated: ${generatedAt.slice(0, 10)} | Stale: ${staleCount}`);
