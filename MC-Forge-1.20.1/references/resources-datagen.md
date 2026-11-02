# Resources and Data Generation

## Resource layout

Use lowercase resource locations and the 1.20.1 plural directory names. Do not copy newer singular-directory layouts into this target.

| Content | Path under a resource root |
| --- | --- |
| Block states | `assets/<modid>/blockstates/<name>.json` |
| Block/item models | `assets/<modid>/models/block/` and `models/item/` |
| Textures | `assets/<modid>/textures/` |
| Translations | `assets/<modid>/lang/en_us.json` |
| Sound definitions | `assets/<modid>/sounds.json` |
| Recipes | `data/<modid>/recipes/` |
| Loot | `data/<modid>/loot_tables/` |
| Tags | `data/<namespace>/tags/blocks/`, `items/`, or the relevant registry path |
| Advancements | `data/<modid>/advancements/` |

Minecraft 1.20.1 uses pack format 15 for resource/data packs. The template deliberately reuses vanilla textures; it does not need copied texture files. A model texture value omits `textures/` and the extension. A model parent omits `models/` and `.json`.

Additive tags normally use `"replace": false`. Use the `minecraft` namespace when contributing to vanilla tool tags. Do not overwrite another namespace's data unless the requested feature explicitly requires an override.

## Models and localization

Choose variants for mutually exclusive states and multipart for independent parts. Verify every reachable property combination. Block items can inherit their block model. A flat item usually inherits `minecraft:item/generated` and defines `layer0`.

Use translation keys in code and resource values in language files. A translatable component is normally localized by the client; do not select the server's language to render all players' messages. Preserve placeholders and formatting across translations.

## Recipes and loot

Use recipe JSON for standard crafting and cooking before creating a custom serializer. Supply an unlock criterion when generating recipe advancements. Do not accidentally override a vanilla recipe ID. See [custom recipes](recipes.md) for new processing contracts.

Give obtainable blocks an intended loot table and ensure tool/tier tags agree with their properties. Consider silk touch, fortune, explosion behavior, and container drops only where relevant. Avoid duplicating inventory drops between a loot table and a removal callback.

## DataGen workflow

Register providers through `GatherDataEvent` on the mod bus. Use `event.includeClient()` and `includeServer()` as appropriate. Provider constructors in 1.20.1 commonly take `PackOutput`, a lookup future, and/or an `ExistingFileHelper`; inspect the exact signature before copying a provider from another version.

Use `BlockStateProvider`/`ItemModelProvider` for models, `RecipeProvider` for recipes, `BlockLootSubProvider` through a loot provider for blocks, and appropriate tag providers. The item tag provider may need the block provider's contents lookup when copying tags. Registration alone does not populate providers with feature data.

Keep `src/generated/resources` in the resource source set. Choose one owner for each resource path: hand-written or generated. Do not leave duplicate files in both roots. Run `runData`, inspect generated changes, then process/build resources. Keep build output, cache files, and data-run worlds out of source control.

The template ships hand-written resources and a configured data run but no providers. A successful empty data run is not evidence that feature resources were generated.

Sources: [resources](https://docs.minecraftforge.net/en/1.20.1/concepts/resources/), [DataGen](https://docs.minecraftforge.net/en/1.20.1/datagen/), [model providers](https://docs.minecraftforge.net/en/1.20.1/datagen/client/modelproviders/), [tags](https://docs.minecraftforge.net/en/1.20.1/resources/server/tags/).
