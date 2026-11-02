# Custom Recipes

Use this only when standard crafting/cooking JSON cannot express the operation.

## Separate the contracts

- `RecipeType` groups recipes for lookup.
- `RecipeSerializer` decodes JSON and synchronizes recipe data over the network.
- A `Recipe` implementation checks inputs and describes results.
- The server machine/menu chooses a recipe and consumes inputs.

Register the type and serializer as static registry entries. In this target, recipe implementations use `Recipe<C extends Container>` and the 1.20.1 methods such as `matches`, `assemble`, `getResultItem`, `canCraftInDimensions`, `getId`, `getType`, and `getSerializer`. Verify signatures with the resolved sources; later `RecipeInput` and codec-only examples do not transfer directly.

## Correctness

`matches` must not mutate the inventory. Result stacks returned for crafting must be fresh copies, not a shared mutable template. Account for input counts, container remainders, output capacity, and whether processing can complete before consuming anything.

Use the active world's `RecipeManager`, not a static forever-cache. Recipe reloads can change results; invalidate or revalidate cached choices. Client recipe information may support display, but server recipes remain authoritative.

For a 1.20.1 serializer, implement matching `fromJson`, `fromNetwork`, and `toNetwork` logic. Enforce sensible count and value bounds, make field order symmetric, and reject invalid identifiers or missing required fields with clear errors. Put JSON under `data/<modid>/recipes/` with `type` equal to the serializer's ID.

## Verification

Check a valid recipe, invalid input, insufficient input, full output, container remainders, interrupted processing, and data reload. Confirm client display after reconnect. If JEI support is requested, use [integrations](integrations/README.md); display registration is separate from recipe execution.

Sources: [custom recipes](https://docs.minecraftforge.net/en/1.20.1/resources/server/recipes/custom/), [recipe generation](https://docs.minecraftforge.net/en/1.20.1/datagen/server/recipes/).
