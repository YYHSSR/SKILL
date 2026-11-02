# Gameplay Systems

## Commands

Register Brigadier commands through `RegisterCommandsEvent`. Use `CommandSourceStack` and the relevant typed arguments. Check permission levels where the operation warrants them, handle sources without a player, and send translatable feedback. Mutate worlds through the command's server context. Avoid parsing arbitrary command text manually when a typed argument exists.

## Advancements

Use vanilla criteria where possible. Put advancement JSON under `data/<modid>/advancements/`, with deliberate parent, display, criteria, requirements, and rewards. Match logical requirements to the intended AND/OR behavior.

Custom triggers require matching condition serialization and server triggering. Verify 1.20.1 trigger signatures. Registration through `CriteriaTriggers.register` belongs in serialized common setup work. Test first award, partial progress, reload, and repeated triggering; do not award rewards repeatedly through a separate event handler.

## Villagers

Add existing-profession trades through the appropriate Forge trade events; wandering-trader trades use their own event. Define profession/level, item counts, experience, uses, and price behavior. Custom professions also need a point of interest and valid workstation states. Check POI registration timing against the resolved sources instead of calling private vanilla helpers from memory.

## Weather and persistent world state

Weather changes run on `ServerLevel`; decide which dimension, duration, and player-visible effect the feature targets. Do not update weather or scan every loaded chunk on each client render frame.

Use block entities for per-block state, entity persistence/capabilities for entity state, and `SavedData` for suitable world-level data. Choose the storage dimension deliberately; use the overworld's data storage if one global record across dimensions is intended. Mark changed `SavedData` dirty and use the 1.20.1 load/save API rather than a later-version factory signature.

Keep expensive work bounded. For periodic scans, cache stable results, react to events when possible, and stagger work across ticks without losing authoritative state.

Sources: [events](https://docs.minecraftforge.net/en/1.20.1/concepts/events/), [advancements](https://docs.minecraftforge.net/en/1.20.1/resources/server/advancements/), [saved data](https://docs.minecraftforge.net/en/1.20.1/datastorage/saveddata/).
