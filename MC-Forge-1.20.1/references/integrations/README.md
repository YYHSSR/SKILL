# Optional Integrations

Read only when a feature needs a third-party dependency or an existing mod already uses one. No library in this list is automatically required.

## Verify the artifact

Find an artifact explicitly supporting **Minecraft 1.20.1 and Forge**. Check its publisher, repository, version, Java requirement, transitive dependencies, and license. Pin the chosen version and use its corresponding source/documentation branch. A current README for a newer release is not sufficient evidence for a 1.20.1 method signature.

Use ForgeGradle's deobfuscation-aware dependency setup where required. Decide whether the dependency is an API-only compile dependency, a runtime dependency, or a bundled dependency with intentional packaging. Declare required mod dependencies in `mods.toml`. Do not bundle another mod by simply copying its JAR into resources.

For optional integrations, gate setup by mod presence and isolate classes that reference foreign types. A presence check is too late if a common class already forces a missing type to load. Test both installed and absent configurations, including a dedicated server.

## Feature routing

| Requested capability | Candidate source to verify |
| --- | --- |
| Recipe display | [JEI](https://github.com/mezz/JustEnoughItems) |
| Animated entities/items/block entities | [GeckoLib](https://github.com/bernie-g/geckolib) |
| Accessory slots | [Curios](https://github.com/TheIllusiveC4/Curios) |
| In-game guide books | [Patchouli](https://github.com/VazkiiMods/Patchouli) |
| Overworld biome distribution | [TerraBlender](https://github.com/Glitchfiend/TerraBlender) |
| Player animation | [Player Animator](https://github.com/KosmX/minecraftPlayerAnimator) |
| Entity scaling | [Pehkui](https://github.com/Virtuoel/Pehkui) |
| Flight capability integration | [Caelus](https://github.com/TheIllusiveC4/Caelus) |

This is a routing list, not a claim that every release supports the target. Verify the exact artifact before selecting it. For configuration, start with [Forge configuration](../configuration.md); use a client UI library only if the requested UI warrants one and its Forge 1.20.1 artifact is verified.

## Integration-specific checks

- JEI: keep plugin classes client-safe; categories, recipes, catalysts, and transfer behavior are separate registration steps. The server still executes recipes.
- GeckoLib: use the API generation for the selected artifact; verify controller lifecycle and model/animation resource paths rather than mixing tutorials from different major versions.
- Curios: distinguish slot definitions, item eligibility, capability exposure, and rendering. Check behavior with and without the optional dependency.
- Patchouli: validate book resource paths, categories, entries, and localization. Do not treat book content as a Java GUI implementation.
- TerraBlender: define biome data first, then distribution and surface integration; verify new chunks and compatibility with other biome mods.

Architectury, Balm, Moonlight, Resourceful Lib, and other shared libraries should remain only when needed by a concrete feature or existing dependency. Do not add a cross-loader architecture to a Forge-only project by default. Kotlin tooling and script-pack development are outside this Java development package's default scope.
