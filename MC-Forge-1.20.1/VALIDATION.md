# Validation Record

## Package scope

This package targets Java 17, Minecraft 1.20.1, and Forge. `AGENTS.md` is the entry document. Topic references, a minimal project template, and local validation tools are included. No separate skill entry file or external instruction package is required.

The original package was preserved outside this directory before replacement. The old Cursor rules, topic skills, cross-platform library catalog, and obsolete Python validator are not part of the active guidance. Their relevant Forge development topics have been consolidated into the references linked by the entry document.

## Verification on 2026-09-28

| Check | Status |
| --- | --- |
| Static template validation | Passed with no findings. |
| Validator regression suite | 14 tests passed. |
| Local links and English document check | Not recorded on this date; see the 2026-11-02 re-check. |
| Java/Gradle build in a temporary copy | Not recorded on this date; see the 2026-11-02 re-check. |
| Interactive client inspection | Not run. |
| Dedicated-server gameplay | Not run. |
| DataGen/GameTests | No providers or tests are supplied by this minimal template. |

The build environment uses Temurin Java 17.0.20 and Node.js 24.21.0. The template keeps the original Gradle 8.5 wrapper, Forge 47.4.10, and Parchment 2023.09.03-1.20.1 settings. Plugin selectors are ranges and may resolve differently later.

Static checks do not prove API correctness, game behavior, or complete TOML/schema validity. The regression suite covers metadata substitutions, dependency owners, version/mapping mismatches, mod-ID grammar, resource paths, malformed JSON, generated-resource duplicates, local/foreign model references, multiline metadata, and machine-readable CLI behavior.

## Re-check on 2026-11-02

| Check | Status |
| --- | --- |
| Package check (`validate-package.mjs`: links, English documents, template) | Passed with no errors or warnings. |
| Validator regression suite | 14 tests passed. |
| Java/Gradle `build` in a temporary copy of the template | Passed; produced a reobfuscated `examplemod-1.0.0.jar`. |
| Interactive client inspection | Not run. |
| Dedicated-server gameplay | Not run. |

The build used Temurin Java 17.0.20 and the template's own Gradle 8.5 wrapper. The template has no test sources, so the `test` task reported no source rather than passing tests.

## Remaining manual checks

In a disposable development world, inspect both example items in their creative tabs, place the example block, check its model/name, mine it with a pickaxe, and craft it from stone. Check a dedicated server separately before describing the template as runtime-tested. No EULA was accepted and no release was uploaded during package construction.
