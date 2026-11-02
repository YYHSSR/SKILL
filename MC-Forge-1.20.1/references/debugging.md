# Debugging and Validation

## Diagnose before changing

Record Minecraft, Forge, Java, mappings, relevant mod versions, distribution, and reproduction steps. Read `latest.log`, `debug.log` when available, and the crash report. Start from the earliest relevant failure and its cause chain, not only the final launch exception.

| Symptom | Check first |
| --- | --- |
| Dependency resolution | Repository URL, coordinates, proxy/TLS, actual published version. |
| Java or Gradle incompatibility | Gradle JVM, toolchain, wrapper, plugin compatibility. |
| Missing method/class at compile time | Exact target version, mappings, imports, resolved sources. |
| Registry object unavailable | Early `.get()`, missing register attachment, wrong bus. |
| Works locally, crashes on dedicated server | Common class references to client-only types. |
| Missing model/texture | Namespace, case, parent/texture paths, resource logs. |
| No block drops | Loot table, tool tags, tier tags, server removal behavior. |
| State resets after reload | Save/load fields and dirty marking. |
| State stale only on client | Chosen sync path, recipients, update notification. |
| Event never fires | Correct bus, static/instance registration, side, phase. |
| Worldgen absent | Data loading errors, biome inclusion, placement, fresh chunks. |

Do not clear every cache, upgrade every dependency, or suppress an error merely because it is unfamiliar. Distinguish environmental download failure from a Java compilation failure.

## Verification ladder

1. Run [static checks](../scripts/README.md) for configuration and resource structure. Warnings are review prompts, not proof of broken Java.
2. Compile affected Java and process resources. Inspect relevant diagnostics rather than relying on exit status alone.
3. Run DataGen if providers changed and review generated changes.
4. Use GameTests for meaningful server behavior when the project supports them. A successful test task with zero relevant tests does not verify the feature.
5. Run client checks for rendering, GUI, input, and resource behavior. Run dedicated-server checks for common gameplay and class isolation.

For inventory/network changes, test two players, disconnect/reconnect, stale requests, full inventories, and world reload where relevant. For machines, verify persistence, actual energy/item transactions, and displayed state. Use disposable worlds.

Do not accept a Minecraft EULA automatically. If a server stops at that gate, report the unexecuted runtime check. Do not call a failed dependency download a successful build.

## Release preparation

Use the project build output intended for distribution, including reobfuscation. Inspect the built JAR for metadata, resource paths, required dependencies, license information, and accidental development files. State the tested Minecraft/Forge range accurately. Existing approval for implementation does not authorize uploading a release or replacing installed mods or user saves.

Report changes, checks actually performed, and remaining limitations. See [the package validation record](../VALIDATION.md) for the template's own status.

Sources: [Forge build/testing](https://docs.minecraftforge.net/en/1.20.1/gettingstarted/), [GameTests](https://docs.minecraftforge.net/en/1.20.1/misc/gametest/), [sides](https://docs.minecraftforge.net/en/1.20.1/concepts/sides/).
