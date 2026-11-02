# Configuration

Use Forge's `ForgeConfigSpec` for ordinary Java mod configuration. A configuration-screen library is optional and does not replace server validation.

Define config values and bounds in a spec, then register it through the target Forge version's `ModLoadingContext` config registration API during mod construction. Verify the exact registration overload against the pinned Forge minor version. Do not eagerly read values in static initializers before configuration has loaded.

| Type | Intended use |
| --- | --- |
| CLIENT | Local visual/input preferences; never authoritative gameplay rules. |
| COMMON | Configuration loaded for the local installation; not automatically synchronized to remote clients. |
| SERVER | World/server settings with Forge's server-config synchronization behavior. |

Handle `ModConfigEvent.Loading` and `Reloading` for the relevant spec on the mod bus if caching derived values. Validate bounds and recompute dependent caches. Distinguish values that can safely reload from changes that require a restart. Do not remove registry entries on config reload; disable behavior instead when possible.

Keep client UI classes isolated. A UI request to change server rules must pass server permission checks. Test dedicated-server startup, client join, a reload, and a missing/default config. Do not modify another mod's settings or global user config to make an example work.

Sources: [Forge configuration](https://docs.minecraftforge.net/en/1.20.1/misc/config/), [Forge 1.20.1 source](https://github.com/MinecraftForge/MinecraftForge/tree/1.20.1).
