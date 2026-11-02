# Additional Content Types

Use the relevant section only. Registration follows [registries and events](registries-events.md).

## Fluids

A custom flowing fluid typically needs a `FluidType`, source and flowing fluids, a `LiquidBlock`, and a bucket. Resolve cyclic references through suppliers rather than early registry lookups. Use `ForgeFlowingFluid.Properties` with the actual 1.20.1 signature. Decide viscosity, density, motion, interactions, bucket remainder, and tags deliberately.

Client fluid textures/tint/fog use the Forge client extensions for the fluid type; isolate their client types. Check source/flow behavior, buckets, containers, persistence, and dedicated-server loading. A texture alone does not create a working fluid.

## Effects, potions, and enchantments

Register effects and potions separately. Define duration/amplifier semantics, beneficial/harmful classification, tick timing, and attributes with stable modifier identifiers. Apply gameplay effects on the server. Potion item variants and brewing recipes are separate integration steps; register brewing additions in serialized setup work when the API is not thread-safe.

Enchantments in this target use the Java registration model. Verify applicability, level/cost bounds, incompatible enchantments, and the event or item hook that implements the effect. Do not import later data-driven enchantment schemas.

## Particles

Register particle types on the common side and providers with `RegisterParticleProvidersEvent` on the client mod bus. Add particle sprite definitions and texture resources when using a sprite set. Use server particle sending for effects visible to tracking players and client-only spawning for intentionally local visuals. Bound counts and avoid expensive full-volume emissions each tick.

## Sounds

Register `SoundEvent`, define `assets/<modid>/sounds.json`, and provide referenced OGG assets or existing sound references. Resource names omit the extension. Choose attenuation, category, volume, pitch, streaming, and subtitles as appropriate. Understand the player exclusion parameter when playing on the server to avoid either double playback or missing playback for the initiator.

Sources: [particles](https://docs.minecraftforge.net/en/1.20.1/gameeffects/particles/), [sounds](https://docs.minecraftforge.net/en/1.20.1/gameeffects/sounds/), [Forge fluids](https://github.com/MinecraftForge/MinecraftForge/tree/1.20.1/src/main/java/net/minecraftforge/fluids).
