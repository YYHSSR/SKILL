# Minecraft Forge 1.20.1 Development Guide

Use this standalone guidance for Java mods targeting **Minecraft 1.20.1, Forge 47.x, and Java 17**. It covers implementation, resources, debugging, and validation. It requires neither another instruction package nor an MCP server.

This directory is a guidance package, not a mod project. The mod template lives in [assets/scaffold](assets/scaffold/README.md). Resolve guidance links relative to this directory and project paths relative to the user's actual mod. Do not build this guidance directory.

## Identify the task

For an existing project, inspect `build.gradle` or `build.gradle.kts`, `gradle.properties`, `settings.gradle`, wrapper properties, and `src/main/resources/META-INF/mods.toml`. Resolve property substitutions before identifying Minecraft, Forge, mappings, and mod ID. `javafml` alone does not establish the platform; check the resolved Forge dependency too.

For a new project explicitly targeting this stack, missing project files are expected. If an existing project targets another version or loader, explain the mismatch before applying this guidance. Do not silently port or replace its build system.

| Task | Approach |
| --- | --- |
| New mod | Read setup, adapt the template, validate identity and resources. |
| Complete feature | Read relevant topics, implement code and required assets/data, verify behavior. |
| Small edit | Follow the existing design and read only affected topics. |
| Failure diagnosis | Read debugging, inspect the earliest relevant cause, make a supported correction. |
| Library integration | Read integrations and inspect the exact dependency before using its API. |

## Standard workflow

1. Confirm the target: Minecraft 1.20.1, Forge 47.x, Java 17, the mappings channel, and the mod ID.
2. Read only the references that match the feature, using the table below.
3. Register content through `DeferredRegister` on the mod bus; subscribe events on the correct bus.
4. Add every resource and data file the feature needs: blockstates, models, textures or vanilla references, `en_us.json` entries, loot tables, tags, and recipes.
5. Keep client-only classes isolated and server state authoritative.
6. Run the static checker, then `compileJava` or `build`, then the game checks the change requires.
7. Report what actually ran, what passed, and what remains unverified.

## Load references on demand

| Topic | Reference |
| --- | --- |
| Java, Gradle, mappings, metadata | [Setup](references/setup.md) |
| DeferredRegister, timing, event buses | [Registries and events](references/registries-events.md) |
| Physical/logical sides, packets, authority | [Sides and networking](references/sides-networking.md) |
| Blocks, items, tools, food, creative tabs | [Blocks and items](references/blocks-items.md) |
| Persistence, synchronization, capabilities, energy, machines | [Block entities and capabilities](references/blockentities-capabilities.md) |
| Menus, slots, screens, key mappings | [Menus and screens](references/menus-screens.md) |
| Mobs, AI, projectiles, entity data, renderers | [Entities and rendering](references/entities-rendering.md) |
| Models, language, tags, loot, recipes, DataGen | [Resources and DataGen](references/resources-datagen.md) |
| Recipe types and serializers | [Custom recipes](references/recipes.md) |
| Biomes, features, structures, dimensions | [World generation](references/worldgen.md) |
| Fluids, effects, potions, enchantments, particles, sounds | [Additional content](references/additional-content.md) |
| Commands, advancements, villagers, weather, world data | [Gameplay systems](references/gameplay-systems.md) |
| Forge configuration and reloads | [Configuration](references/configuration.md) |
| Access transformers and Mixin | [Advanced hooks](references/advanced-hooks.md) |
| Logs, builds, game checks, releases | [Debugging and validation](references/debugging.md) |
| Optional libraries and compatibility | [Integrations](references/integrations/README.md) |

## Invariants

- Use Java 17 and the selected official or Parchment mappings. Do not mix Yarn, legacy MCP names, or later-version APIs into 1.20.1 code.
- Prefer `DeferredRegister` and `RegistryObject` for static registration. Dynamic worldgen data follows a different path.
- Keep authoritative gameplay on the logical server. Isolate client classes from dedicated-server loading. Package names and `@OnlyIn` are not general isolation mechanisms.
- Treat client packets as requests. Validate sender, permission, target, distance, loaded state, and input bounds before changing server state.
- Keep serialization, saving, dirty marking, and synchronization distinct. A changed Java field is not automatically saved or synchronized.
- Keep mod ID consistent across entrypoint, resolved metadata, resource namespaces, and dependency table owner. A dependency's `modId` names that dependency, not the owning mod.
- Preserve project layout and dependency versions unless the task requires adjustment. Recommendations here are not universal Forge restrictions.
- Complete the resources/data a feature needs. Do not declare a block complete with missing intended models, loot, tags, or localization.

## Frequent version mistakes

Code copied from tutorials for other versions is the most common source of errors. Reject these patterns in 1.20.1 code:

| Wrong for 1.20.1 | Use instead |
| --- | --- |
| `Item.Properties().tab(...)` | `BuildCreativeModeTabContentsEvent` or a registered `CreativeModeTab` |
| `Material.STONE`, `Block.Properties.of(Material...)` | `BlockBehaviour.Properties.of().mapColor(...)` |
| `PoseStack`-based `Screen#render` signatures | `GuiGraphics` |
| Data components (`DataComponents`, `DataComponentType`) | `ItemStack` NBT tags |
| `RecipeInput`, codec-only recipe serializers | `Recipe<C extends Container>` with `fromJson`/`fromNetwork`/`toNetwork` |
| NeoForge packages (`net.neoforged.*`) or `PayloadRegistrar` | `net.minecraftforge.*` and `SimpleChannel` |
| Singular data folders (`recipe/`, `loot_table/`, `tags/block/`) | Plural folders (`recipes/`, `loot_tables/`, `tags/blocks/`) |
| `ResourceLocation.fromNamespaceAndPath(...)` | `new ResourceLocation(namespace, path)` |
| Fabric or Yarn names (`Identifier`, `Registry.register`) | Mojang/Parchment names and `DeferredRegister` |

When unsure whether a class or method exists in 1.20.1, check the resolved Forge sources in the project instead of guessing.

## Evidence and completion

Use resolved dependency source and version-specific official documentation for uncertain signatures. Partial snippets are explicitly marked; the template is the complete project example. No tool named in the old package is required. If an optional Forge documentation MCP is available, discover supported versions before querying it and select 1.20.1 explicitly.

Use [scripts/README.md](scripts/README.md) for lightweight checks. They do not compile Java or replace Forge loading tests. Choose compilation, resource processing, DataGen, GameTests, or manual game checks according to the change. Report what actually ran and any unresolved limitations. [VALIDATION.md](VALIDATION.md) records this package's verification.

Follow existing user authorization for editing and local verification. Uploading artifacts, publishing, overwriting saves, and accepting a server EULA require explicit authorization. Use disposable development worlds for game checks.
