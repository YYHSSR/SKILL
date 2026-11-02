# World Generation

## Static types versus dynamic entries

Register executable types such as a custom feature or structure type through the appropriate static registry. Supply configured features, placed features, biomes, structures, structure sets, and dimension definitions as data entries. A custom structure extends `Structure`; `Structure.StructureSettings` is its configuration value, not the base class to extend.

Use `ResourceKey<T>` to identify dynamic entries and registry lookups/holders to connect them. Never force an early `.get()` on a dynamic entry during mod construction.

## Workflow

1. Decide whether vanilla feature/structure types can express the desired content.
2. Define namespaced keys and the dependency graph between configured and placed entries.
3. Write version-correct JSON or generate it with `RegistrySetBuilder`, bootstrap contexts, and `DatapackBuiltinEntriesProvider`.
4. For generation in existing biomes, use the appropriate Forge biome modifier data, targeting biome tags where possible.
5. For new overworld biome distribution, consider a verified Forge 1.20.1 TerraBlender integration rather than assuming biome registration inserts it into terrain.
6. Test in newly generated chunks of a disposable world. Existing generated chunks do not automatically regenerate.

Use 1.20.1 vanilla data and resolved registry sources as the schema reference. Do not copy JSON from a later Minecraft release without checking codecs and field names.

## Features and structures

Configured features describe the operation and configuration. Placed features describe where/how often it is attempted. Order placement modifiers deliberately. Check target blocks, height bounds, biome filtering, count/rarity, and generation step. A registered placed feature still needs to be included in biome generation.

For structures, check the structure entry, structure set placement, template pools, processors, template resources, biome restrictions, and terrain adaptation as applicable. A template file alone is not a generated structure. Test spacing, separation, locating, and actual appearance.

## Dimensions

Dimension type, dimension definition, and world-generation dependencies are distinct. Define lighting, time, coordinate scaling, height, generator, and biome source intentionally. Custom portal/teleport logic must validate the destination and safe placement on the server. Keep stable identifiers for existing saves; changing them can invalidate saved world references.

Sources: [dynamic registries](https://docs.minecraftforge.net/en/1.20.1/concepts/registries/), [datapack registry providers](https://docs.minecraftforge.net/en/1.20.1/datagen/server/datapackregistries/), [Forge biome modifiers](https://github.com/MinecraftForge/MinecraftForge/blob/1.20.1/src/main/java/net/minecraftforge/common/world/ForgeBiomeModifiers.java).
