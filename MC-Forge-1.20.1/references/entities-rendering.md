# Entities and Rendering

## Entity design

Choose the base class for the behavior: animal, monster, pathfinding mob, projectile, or plain entity. Register `EntityType` with deliberate dimensions, category, tracking range, and update interval. Registration does not spawn instances.

Supply living attributes through `EntityAttributeCreationEvent`. Spawn eggs, natural spawning, placement rules, and biome spawn additions are separate requirements. Check whether the chosen superclass already supplies the correct spawn packet; where necessary use `NetworkHooks.getEntitySpawningPacket(this)` in `getAddEntityPacket`.

Use goal/target selectors with deliberate priorities and flags; preserve superclass goals where desired. Use Brain only when its memories, sensors, and activities fit the feature. Damage, drops, targeting, and authoritative projectile hits run on the logical server. Preserve owner attribution and define collisions, lifetime, and removal.

## Tracked and saved state

Define `SynchedEntityData` accessors only on the custom entity that owns them. Initialize in `defineSynchedData`, calling the superclass. Persist appropriate fields in `addAdditionalSaveData` and `readAdditionalSaveData`; tracking does not replace saving. Use extra spawn data for suitable fixed information. Verify reload and leave/re-enter tracking behavior.

## Client rendering

Register renderers in `EntityRenderersEvent.RegisterRenderers` and layers in `RegisterLayerDefinitions` on the client mod bus. Isolate renderers/models/client dependencies. Block entity renderers are for dynamic visuals that ordinary models cannot provide efficiently.

Check layer IDs, model part names, UVs, textures, and render types. Balance pose stack push/pop operations. Interpolate animation with partial ticks without changing authoritative state while rendering. For library animation, read [integrations](integrations/README.md).

Sources: [entity synchronization](https://docs.minecraftforge.net/en/1.20.1/networking/entities/), [block entity rendering](https://docs.minecraftforge.net/en/1.20.1/blockentities/ber/), [Forge 1.20.1 source](https://github.com/MinecraftForge/MinecraftForge/tree/1.20.1).
