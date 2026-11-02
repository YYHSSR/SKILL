# Validation Tools

Requires Node.js 18 or later. No npm packages, Python, MCP, or network access are required. Scripts are read-only except that the test suite creates and removes its own temporary fixtures.

From the guidance package directory:

```text
node scripts/validate-project.mjs assets/scaffold --json
node scripts/validate-package.mjs
node --test scripts/validate-project.test.mjs
```

For a real mod, pass its project directory to `validate-project.mjs`. Quote paths containing spaces. Exit codes are 0 for no blocking static errors, 1 for findings with errors, and 2 for invocation/read failures. JSON mode emits one JSON document on stdout. Warnings require review even when exit status is 0.

## Scope and limits

Project checks cover conventional version properties, basic metadata fields and dependency ownership, mod-ID format, JSON syntax, pack format, resource-path characters, duplicate resources across main/generated roots, and selected local model/texture references. Entrypoint ID comparisons are heuristic warnings.

The metadata reader supports simple strings, booleans, multiline descriptions, mod tables, and unquoted dependency-owner tables. It is deliberately not a general TOML parser. Unsupported constructs or unresolved build expressions produce warnings rather than a false claim of full validation. Properties parsing is also limited to ordinary single-line key/value entries. Inspect processed metadata or use a full TOML parser for advanced build configurations.

The checker does not evaluate Gradle, resolve arbitrary Java constants, prove event wiring, parse custom source sets, validate every Minecraft JSON schema, inspect external mod resources, compile Java, or launch Forge. It cannot establish that the project runs. Registry names containing valid hyphens/slashes are not rejected as invalid mod IDs.

Package checks verify local document links, absence of old mandatory tool references, English/CJK separation, the requested absence of SKILL.md files, and the template's static checks. Language scanning is a guard against untranslated Chinese content, not a complete natural-language classifier. External documentation links are not fetched by these scripts.
