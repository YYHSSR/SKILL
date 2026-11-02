#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ignored = new Set(['.git', '.gradle', 'node_modules', 'build', 'run', 'run-data']);
export function filesUnder(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink() || ignored.has(entry.name)) return [];
    const full = path.join(root, entry.name);
    return entry.isDirectory() ? filesUnder(full) : entry.isFile() ? [full] : [];
  });
}

export function readProperties(text) {
  const values = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#!\s=:]+)\s*[=:]\s*(.*?)\s*$/);
    if (match) values[match[1]] = match[2];
  }
  return values;
}

// Deliberately a metadata subset reader, not a general TOML parser.
// Unsupported constructs are surfaced instead of guessed.
export function readMetadata(text) {
  const result = { top: {}, mods: [], dependencies: [], unsupported: [] };
  let current = result.top;
  let multiline = null;
  for (const [index, source] of text.split(/\r?\n/).entries()) {
    const line = source.trim();
    if (multiline) {
      if (line.includes(multiline)) multiline = null;
      continue;
    }
    if (!line || line.startsWith('#')) continue;
    const table = line.match(/^\[\[\s*(.+?)\s*\]\]\s*(?:#.*)?$/);
    if (table) {
      current = {};
      if (table[1] === 'mods') result.mods.push(current);
      else if (/^dependencies\.[a-z][a-z0-9_]*$/.test(table[1])) {
        result.dependencies.push({ owner: table[1].slice(13), values: current });
      } else result.unsupported.push(index + 1);
      continue;
    }
    if (line.startsWith('[')) {
      current = {};
      result.unsupported.push(index + 1);
      continue;
    }
    const assignment = line.match(/^([A-Za-z][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!assignment) { result.unsupported.push(index + 1); continue; }
    const [, key, value] = assignment;
    if (Object.hasOwn(current, key)) {
      result.unsupported.push(index + 1);
      continue;
    }
    if (value.startsWith("'''") || value.startsWith('"""')) {
      const quote = value.slice(0, 3);
      current[key] = value.slice(3).split(quote)[0];
      if (!value.slice(3).includes(quote)) multiline = quote;
    } else if (/^"(?:[^"\\]|\\.)*"\s*(?:#.*)?$/.test(value)) {
      try { current[key] = JSON.parse(value.match(/^"(?:[^"\\]|\\.)*"/)[0]); }
      catch { result.unsupported.push(index + 1); }
    } else if (/^'[^']*'\s*(?:#.*)?$/.test(value)) {
      current[key] = value.slice(1, value.indexOf("'", 1));
    } else if (/^(true|false)\s*(?:#.*)?$/.test(value)) {
      current[key] = value.startsWith('true');
    } else result.unsupported.push(index + 1);
  }
  if (multiline) result.unsupported.push('unterminated multiline string');
  return result;
}

export function validateProject(project) {
  const root = path.resolve(project);
  const findings = [];
  const add = (severity, code, file, message) => findings.push({ severity, code,
    file: path.relative(root, file).replaceAll('\\', '/'), message });
  const error = (...args) => add('error', ...args);
  const warn = (...args) => add('warning', ...args);
  const read = file => fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const finish = modIds => ({ project: root, valid: !findings.some(x => x.severity === 'error'),
    scope: 'Static configuration/resource checks only; no Java compilation or runtime verification.',
    modIds, findings });
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    error('project-missing', root, 'Project directory does not exist.');
    return finish([]);
  }
  const build = ['build.gradle', 'build.gradle.kts'].map(name => path.join(root, name))
    .find(file => fs.existsSync(file));
  if (!build) error('build-missing', root, 'No Gradle build file found.');
  else if (!read(build).includes('net.minecraftforge')) {
    warn('forge-unresolved', build, 'Forge dependency/plugin was not recognized; inspect the actual build configuration.');
  }
  const gp = path.join(root, 'gradle.properties');
  const props = fs.existsSync(gp) ? readProperties(read(gp)) : {};
  if (!fs.existsSync(gp)) warn('properties-missing', gp, 'No properties file; inspect versions defined elsewhere.');
  if (props.minecraft_version && props.minecraft_version !== '1.20.1') {
    error('minecraft-version', gp, `Expected 1.20.1, found ${props.minecraft_version}.`);
  }
  if (props.forge_version && !/^47\./.test(props.forge_version)) {
    error('forge-version', gp, `Expected Forge 47.x, found ${props.forge_version}.`);
  }
  if (props.mapping_channel === 'official' && props.mapping_version !== '1.20.1') {
    error('mapping-version', gp, 'Official mappings must target 1.20.1.');
  }
  if (props.mapping_channel === 'parchment' && !/^\d{4}\.\d{2}\.\d{2}-1\.20\.1$/.test(props.mapping_version ?? '')) {
    error('mapping-version', gp, 'Expected a Parchment date ending in -1.20.1.');
  }
  if (props.mapping_channel && !['official', 'parchment'].includes(props.mapping_channel)) {
    warn('mapping-channel', gp, 'Mappings are outside this guide; inspect before using its API names.');
  }
  const roots = ['src/main/resources', 'src/generated/resources'].map(name => path.join(root, name));
  const mt = path.join(roots[0], 'META-INF/mods.toml');
  let modIds = [];
  if (!fs.existsSync(mt)) error('metadata-missing', mt, 'Missing standard-source-set mods.toml.');
  else {
    const unresolved = new Set();
    const expanded = read(mt).replace(/\$\{([^}]+)\}/g, (whole, key) => {
      if (Object.hasOwn(props, key)) return props[key];
      if (!key.startsWith('file.')) unresolved.add(key);
      return whole;
    });
    if (unresolved.size) warn('metadata-unresolved', mt,
      `Unresolved build expressions: ${[...unresolved].join(', ')}. Inspect processed metadata.`);
    const metadata = readMetadata(expanded);
    const partial = metadata.unsupported.length > 0 || unresolved.size > 0;
    if (metadata.unsupported.length) warn('toml-subset', mt,
      `Full TOML validation is required; unsupported/ambiguous lines: ${metadata.unsupported.join(', ')}.`);
    const missing = (code, message) => (partial ? warn : error)(code, mt, message);
    for (const key of ['modLoader', 'loaderVersion', 'license']) {
      if (!metadata.top[key]) missing('metadata-field', `Missing top-level ${key}.`);
    }
    if (metadata.top.modLoader && !metadata.top.modLoader.includes('${') && metadata.top.modLoader !== 'javafml') {
      error('loader', mt, 'This Java Forge guide expects javafml.');
    }
    if (!metadata.mods.length) missing('mods-table', 'No [[mods]] table found.');
    for (const mod of metadata.mods) {
      if (!mod.modId) { missing('mod-id', 'Missing modId in a mod table.'); continue; }
      if (mod.modId.includes('${')) continue;
      if (!/^[a-z][a-z0-9_]{1,63}$/.test(mod.modId)) error('mod-id', mt, `Invalid mod ID: ${mod.modId}.`);
      modIds.push(mod.modId);
    }
    if (new Set(modIds).size !== modIds.length) error('mod-id-duplicate', mt, 'Duplicate mod IDs.');
    if (props.mod_id && modIds.length === 1 && props.mod_id !== modIds[0]) {
      error('mod-id-mismatch', mt, 'Resolved metadata ID differs from gradle.properties mod_id.');
    }
    for (const dependency of metadata.dependencies) {
      if (modIds.length && !modIds.includes(dependency.owner)) {
        error('dependency-owner', mt, `Dependency owner ${dependency.owner} has no matching mod table.`);
      }
    }
    for (const modId of modIds) {
      for (const required of ['forge', 'minecraft']) {
        const dep = metadata.dependencies.find(x => x.owner === modId && x.values.modId === required);
        if (!dep) warn('dependency-missing', mt, `${modId} has no recognized ${required} dependency.`);
        else {
          if (dep.values.mandatory !== true) warn('dependency-optional', mt, `${required} should be mandatory for this template.`);
          if (required === 'minecraft' && dep.values.versionRange && dep.values.versionRange !== '[1.20.1]') {
            warn('minecraft-range', mt, 'Review the Minecraft range against actually tested versions.');
          }
        }
      }
    }
  }
  const seen = new Map();
  const jsonFiles = new Map();
  for (const resourceRoot of roots) for (const file of filesUnder(resourceRoot)) {
    const rel = path.relative(resourceRoot, file).replaceAll('\\', '/');
    if (seen.has(rel)) error('duplicate-resource', file, `Also present in ${path.relative(root, seen.get(rel))}.`);
    seen.set(rel, file);
    if (/^(assets|data)\//.test(rel) && !/^(assets|data)\/[a-z0-9_.-]+\/[a-z0-9/._-]+$/.test(rel)) {
      error('resource-path', file, 'Invalid namespace/path characters or uppercase resource path.');
    }
    if (file.endsWith('.json') || file.endsWith('.mcmeta')) {
      try { jsonFiles.set(rel, { file, value: JSON.parse(read(file)) }); }
      catch (e) { error('json-syntax', file, e.message); }
    }
  }
  const pack = jsonFiles.get('pack.mcmeta');
  if (!seen.has('pack.mcmeta')) warn('pack-missing', roots[0], 'No pack.mcmeta found.');
  else if (pack && pack.value?.pack?.pack_format !== 15) {
    error('pack-format', pack.file, 'Expected pack_format 15 for Minecraft 1.20.1.');
  }
  function modelReference(value, from, kind) {
    if (typeof value !== 'string' || value.startsWith('#')) return;
    const match = value.match(/^([a-z0-9_.-]+):([a-z0-9/._-]+)$/);
    if (!match || !modIds.includes(match[1])) return; // Foreign resources may come from dependencies.
    const target = `assets/${match[1]}/${kind}/${match[2]}${kind === 'models' ? '.json' : '.png'}`;
    if (!seen.has(target)) warn('resource-reference', from, `Unresolved local ${kind} reference: ${value}. Custom loaders may provide it.`);
  }
  for (const [rel, { file, value }] of jsonFiles) {
    if (/^assets\/[^/]+\/models\//.test(rel)) {
      modelReference(value?.parent, file, 'models');
      for (const texture of Object.values(value?.textures ?? {})) modelReference(texture, file, 'textures');
    }
    if (/^assets\/[^/]+\/blockstates\//.test(rel)) {
      const visit = value => {
        if (!value || typeof value !== 'object') return;
        if (value.model) modelReference(value.model, file, 'models');
        for (const child of Object.values(value)) visit(child);
      };
      visit(value);
    }
  }
  const javaFiles = filesUnder(path.join(root, 'src/main/java')).filter(file => file.endsWith('.java'));
  if (!javaFiles.length) warn('java-missing', root, 'No Java sources found in the standard source set.');
  for (const file of javaFiles) {
    const source = read(file);
    for (const match of source.matchAll(/@Mod\s*\(\s*"([^"]+)"\s*\)/g)) {
      if (modIds.length && !modIds.includes(match[1])) warn('java-mod-id', file, `Literal @Mod ID ${match[1]} differs from metadata; verify source.`);
    }
    const constant = source.match(/\bString\s+MOD_ID\s*=\s*"([^"]+)"/);
    if (constant && /@Mod\s*\([^)]*\bMOD_ID\s*\)/.test(source) && modIds.length && !modIds.includes(constant[1])) {
      warn('java-mod-id', file, 'Entrypoint MOD_ID differs from metadata; verify source.');
    }
  }
  return finish(modIds);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const paths = args.filter(arg => !arg.startsWith('--'));
  if (paths.length !== 1 || args.some(arg => arg.startsWith('--') && arg !== '--json')) {
    console.error('Usage: node validate-project.mjs <mod-project> [--json]');
    process.exitCode = 2;
  } else {
    try {
      const report = validateProject(paths[0]);
      if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
      else {
        console.log(report.scope);
        for (const f of report.findings) console.log(`${f.severity.toUpperCase()} ${f.code} ${f.file}: ${f.message}`);
        console.log(report.valid ? 'No blocking static errors.' : 'Static errors found.');
      }
      process.exitCode = report.valid ? 0 : 1;
    } catch (error) {
      if (args.includes('--json')) console.log(JSON.stringify({ valid: false, failure: error.message }));
      else console.error(error.message);
      process.exitCode = 2;
    }
  }
}
