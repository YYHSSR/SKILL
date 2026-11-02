import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { validateProject, readMetadata } from './validate-project.mjs';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const scaffold = path.resolve(scriptRoot, '../assets/scaffold');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-guide-test-'));
  fs.cpSync(scaffold, root, { recursive: true });
  t.after(() => {
    const resolved = path.resolve(root);
    if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('forge-guide-test-')) {
      throw new Error('Refusing cleanup outside the test fixture.');
    }
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  return root;
}
function write(root, rel, text) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}
const codes = root => validateProject(root).findings.map(f => f.code);
const metadata = 'src/main/resources/META-INF/mods.toml';

test('template is statically valid without warnings', () => {
  const result = validateProject(scaffold);
  assert.equal(result.valid, true);
  assert.deepEqual(result.findings, []);
});
test('property-based mod ID and dependency owner expand together', t => {
  const root = fixture(t);
  const gp = path.join(root, 'gradle.properties');
  fs.writeFileSync(gp, fs.readFileSync(gp, 'utf8').replace('mod_id=examplemod', 'mod_id=renamed_mod'));
  const result = validateProject(root);
  assert.deepEqual(result.modIds, ['renamed_mod']);
  assert.ok(!codes(root).includes('dependency-owner'));
  assert.ok(codes(root).includes('java-mod-id'));
});
test('mismatched dependency owner is detected', t => {
  const root = fixture(t);
  const file = path.join(root, metadata);
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('dependencies.${mod_id}', 'dependencies.wrong_mod'));
  assert.ok(codes(root).includes('dependency-owner'));
});
test('valid resource paths with hyphens and nested directories pass', t => {
  const root = fixture(t);
  write(root, 'src/main/resources/data/examplemod/tags/items/nested/my-tag.json', '{"values":[]}');
  assert.ok(!codes(root).includes('resource-path'));
});
test('malformed JSON and uppercase directory are detected', t => {
  const root = fixture(t);
  write(root, 'src/main/resources/assets/examplemod/models/Bad/file.json', '{bad}');
  assert.ok(codes(root).includes('json-syntax'));
  assert.ok(codes(root).includes('resource-path'));
});
test('generated resources participate in duplicate and JSON checks', t => {
  const root = fixture(t);
  write(root, 'src/generated/resources/assets/examplemod/lang/en_us.json', '{}');
  write(root, 'src/generated/resources/data/examplemod/recipes/bad.json', '{');
  assert.ok(codes(root).includes('duplicate-resource'));
  assert.ok(codes(root).includes('json-syntax'));
});
test('mapping and target mismatch are detected', t => {
  const root = fixture(t);
  const gp = path.join(root, 'gradle.properties');
  fs.writeFileSync(gp, fs.readFileSync(gp, 'utf8').replace('minecraft_version=1.20.1', 'minecraft_version=1.21')
    .replace('mapping_channel=parchment', 'mapping_channel=official'));
  assert.ok(codes(root).includes('minecraft-version'));
  assert.ok(codes(root).includes('mapping-version'));
});
test('mod ID and resource path grammar are distinct', t => {
  const root = fixture(t);
  const gp = path.join(root, 'gradle.properties');
  fs.writeFileSync(gp, fs.readFileSync(gp, 'utf8').replace('mod_id=examplemod', 'mod_id=a'));
  assert.ok(codes(root).includes('mod-id'));
});
test('unknown expressions are reported as unresolved', t => {
  const root = fixture(t);
  const file = path.join(root, metadata);
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('${mod_id}', '${custom_id}'));
  assert.ok(codes(root).includes('metadata-unresolved'));
});
test('TOML multiline content does not become metadata', () => {
  const result = readMetadata("modLoader='javafml'\n[[mods]]\nmodId='examplemod'\ndescription='''\n[[mods]]\nmodId='fake'\n'''\n");
  assert.equal(result.mods.length, 1);
  assert.equal(result.mods[0].modId, 'examplemod');
});
test('foreign model references are not falsely rejected', t => {
  const root = fixture(t);
  write(root, 'src/main/resources/assets/examplemod/models/item/external.json', '{"parent":"anothermod:item/base"}');
  assert.ok(!codes(root).includes('resource-reference'));
});
test('missing local model reference is reviewable', t => {
  const root = fixture(t);
  write(root, 'src/main/resources/assets/examplemod/models/item/external.json', '{"parent":"examplemod:item/missing"}');
  assert.ok(codes(root).includes('resource-reference'));
});
test('JSON CLI emits exactly one parseable report and appropriate status', t => {
  const root = fixture(t);
  write(root, 'src/main/resources/pack.mcmeta', '{"pack":{"pack_format":99}}');
  const run = spawnSync(process.execPath, [path.join(scriptRoot, 'validate-project.mjs'), root, '--json'], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.equal(JSON.parse(run.stdout).valid, false);
  assert.equal(run.stderr, '');
});
test('missing project returns a structured failure', () => {
  const result = validateProject(path.join(os.tmpdir(), 'nonexistent-forge-guide-' + randomUUID()));
  assert.equal(result.valid, false);
  assert.equal(result.findings[0].code, 'project-missing');
});
