# Project Setup

Read for new projects and build or metadata changes.

## Target and mappings

Use a 64-bit JDK 17. Check Gradle's JVM as well as `java`; IDE settings may differ. The [template](../assets/scaffold/README.md) retains Forge 47.4.10 and Gradle 8.5 from the original package. This is a baseline, not a claim about the latest release, an unmodified MDK, or the minimum API version. Existing projects retain their own compatible versions.

Use ForgeGradle 6.x and the project wrapper. Replace wrapper scripts, properties, and JAR as a coherent set when changing it. Prefer an official MDK for the selected Forge release when starting a different baseline.

Keep existing mappings. The template uses Parchment `2023.09.03-1.20.1` and Librarian. Parchment enriches Mojang names with parameter names/documentation. For official mappings set `mapping_channel=official` and `mapping_version=1.20.1`. Do not substitute a date or legacy MCP snapshot identifier. Removing Parchment entirely also requires reviewing its plugin and repositories.

## Adapt the template

1. Copy into an empty destination, not over an existing mod.
2. Set mod ID, name, group, version, authors, description, and intended license in `gradle.properties`.
3. Rename Java packages and `MOD_ID`, the `assets/examplemod` and `data/examplemod` directories, and IDs within their files. Keep vanilla `minecraft` namespaces intact.
4. Check metadata expansion. `[[dependencies.${mod_id}]]` follows the configured owner ID; the dependency inside the table remains `forge` or `minecraft`.
5. Run static checks and relevant Gradle tasks. Inspect processed metadata and the built JAR when diagnosing substitutions.

Forge mod IDs follow `[a-z][a-z0-9_]{1,63}`. Resource paths use a different grammar: lowercase letters, digits, `_`, `-`, `.`, and `/` are valid. Do not reject a resource path merely for containing a hyphen.

Keep JavaFML `loaderVersion`, Forge compatibility, and Minecraft compatibility separate. The template targets exactly Minecraft 1.20.1 using `[1.20.1]`; do not imply support for later 1.20 releases. Widen its Forge baseline range only after checking older APIs.

## Useful Gradle tasks

Run from the mod project with `.\gradlew.bat` on Windows or `./gradlew` on Unix (set its executable bit if needed).

| Task | Purpose |
| --- | --- |
| `compileJava` | Check Java types and API signatures. |
| `processResources` | Expand metadata and copy resources. |
| `build` | Assemble, run configured checks, and produce the reobfuscated artifact. |
| `runData` | Run registered data providers. |
| `runClient` | Inspect rendering, screens, input, and local play. |
| `runServer` | Check dedicated-server loading and gameplay. |
| `runGameTestServer` | Execute registered GameTests when present. |

`--no-build-cache` disables the build cache and `--rerun-tasks` forces execution; neither skips tests. Avoid routine `clean` or cache deletion without evidence of stale outputs.

Sources: [Forge setup](https://docs.minecraftforge.net/en/1.20.1/gettingstarted/), [mod files](https://docs.minecraftforge.net/en/1.20.1/gettingstarted/modfiles/), [Gradle CLI](https://docs.gradle.org/current/userguide/command_line_interface.html).
