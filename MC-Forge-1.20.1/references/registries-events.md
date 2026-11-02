# Registries and Events

Read before registration or event subscription.

## Registration

Attach each `DeferredRegister<T>` once to the mod bus during mod construction. Register suppliers and retain `RegistryObject<T>`. Resolve `.get()` only when the referenced registration is available, not in unrelated early static initializers.

The complete example is [ModContent.java](../assets/scaffold/src/main/java/com/example/examplemod/registry/ModContent.java). `BlockItem` explicitly references its block; matching names alone do not associate them. Calling `new` in a supplier is normal; construction alone is not registration.

`RegisterEvent` is supported too. Preserve correct existing event-based registration. Use `ForgeRegistries` for Forge registries and `Registries` keys for other static registries such as creative tabs. Verify custom registry `makeRegistry` signatures against the resolved Forge version.

Biomes and other dynamic worldgen entries use resource keys and data files, optionally generated through `RegistrySetBuilder` and `DatapackBuiltinEntriesProvider`. Do not apply `DeferredRegister<Block>` patterns to biome data. See [world generation](worldgen.md).

## Event buses

| Event/action | Bus |
| --- | --- |
| Register attachment, common/client setup | Mod |
| `EntityAttributeCreationEvent`, `GatherDataEvent` | Mod |
| `RegisterCapabilitiesEvent`, creative tab contents | Mod |
| Renderer/layer registration, key mappings, particle providers | Client mod |
| Player interaction, living damage, server lifecycle | Forge |
| `RegisterCommandsEvent`, `AttachCapabilitiesEvent` | Forge |

For uncertain events, inspect the actual type. Choose explicit registration or automatic `@Mod.EventBusSubscriber`, avoiding duplicate subscriptions. Automatic subscriber handlers are static; instance handlers need a registered instance. `@SubscribeEvent` alone does not register a listener.

Common setup runs on both physical distributions. Parallel lifecycle callbacks use `enqueueWork` for work requiring serial access. Renderer registration has its own `EntityRenderersEvent.RegisterRenderers`; do not subscribe to that event from inside client setup.

Check whether an event is cancellable before cancelling. Handle START/END tick phases deliberately to avoid running twice. Choose priority based on the intended interaction with other mods, not as a universal default.

Sources: [registries](https://docs.minecraftforge.net/en/1.20.1/concepts/registries/), [events](https://docs.minecraftforge.net/en/1.20.1/concepts/events/), [lifecycle](https://docs.minecraftforge.net/en/1.20.1/concepts/lifecycle/).
