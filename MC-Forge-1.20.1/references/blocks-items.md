# Blocks and Items

## Representation

Use plain `Block`/`Item` instances when properties suffice, subclasses for behavior, finite block states for facing/powered variants, and block entities for inventories or persistent counters. Do not encode unbounded values in block states.

Useful properties include `mapColor`, `strength`, `sound`, `lightLevel`, `noOcclusion`, and `requiresCorrectToolForDrops`. Occlusion, collision, lighting, and render type are separate decisions. For intentionally absent loot use `noLootTable()`, not the nonexistent `noLootTablePoolsBuilder()`.

Stateful blocks define properties in `createBlockStateDefinition`, register a default state, and handle placement, rotation, and mirroring where needed. Models must cover reachable states.

## Complete the content

See the [template registry](../assets/scaffold/src/main/java/com/example/examplemod/registry/ModContent.java). Check block registration, explicit `BlockItem` association, creative tab placement when requested, blockstates, block/item models, textures or vanilla references, display names, loot, and requested recipes.

Blocks requiring tools also need appropriate `minecraft:mineable/*` and tier tags. `requiresCorrectToolForDrops()` alone does not define tool category/tier. Perform inventory consumption and drops on the logical server. For machines, only drop contents when actually replacing the block, not on every block state change.

## Items and tabs

Use `Item.Properties` for stack size, durability, rarity, and food. Check 1.20.1 tool/armor constructors against resolved sources. This version uses `ItemStack` NBT for custom stack data; do not use later data-component APIs. Preserve superclass use behavior when intended. Food uses `FoodProperties.Builder` and the normal use lifecycle.

Custom tool tiers may require Forge tier ordering; a number alone does not guarantee compatibility with modded tools. Armor assets and renderer hooks require their own checks and client isolation.

Use `BuildCreativeModeTabContentsEvent` on the mod bus for existing tabs. Register custom tabs using `Registries.CREATIVE_MODE_TAB`, a translatable title, icon supplier, and display callback. Do not use removed `Item.Properties.tab` patterns.

Sources: [blocks](https://docs.minecraftforge.net/en/1.20.1/blocks/), [block states](https://docs.minecraftforge.net/en/1.20.1/blocks/states/), [items](https://docs.minecraftforge.net/en/1.20.1/items/).
