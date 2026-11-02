#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { filesUnder, validateProject } from './validate-project.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const files = filesUnder(root);
const documents = files.filter(file => /\.md$/i.test(file));
for (const file of files) {
  if (path.basename(file).toLowerCase() === 'skill.md') errors.push('Unexpected SKILL.md: ' + path.relative(root, file));
}
for (const file of documents) {
  const content = fs.readFileSync(file, 'utf8');
  const name = path.relative(root, file);
  if (/\p{Script=Han}/u.test(content)) errors.push('Non-English CJK text: ' + name);
  if (/En-SKILL\.md|mcp-server\/dist|community_knowledge\//i.test(content)) errors.push('External legacy dependency: ' + name);
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|#)/i.test(href)) continue;
    const target = path.resolve(path.dirname(file), decodeURIComponent(href.split('#')[0]));
    if (!target.startsWith(root + path.sep) && target !== root) errors.push(`Link escapes package: ${name} -> ${href}`);
    else if (!fs.existsSync(target)) errors.push(`Broken local link: ${name} -> ${href}`);
  }
}
const project = validateProject(path.join(root, 'assets/scaffold'));
errors.push(...project.findings.filter(x => x.severity === 'error').map(x => `${x.code}: ${x.message}`));
console.log(JSON.stringify({ valid: errors.length === 0, documents: documents.length,
  files: files.length, errors, templateWarnings: project.findings.filter(x => x.severity === 'warning') }, null, 2));
process.exitCode = errors.length ? 1 : 0;
