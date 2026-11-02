# Sides and Networking

Read for multiplayer behavior, client classes, or custom messages.

## Side and authority

A physical client contains a logical client and, in singleplayer, a logical server. Dedicated servers have no Minecraft client classes. Use `Level#isClientSide` for a world operation's logical side; use client event subscriptions or appropriate `DistExecutor` dispatch for client-only code.

Keep screens, renderers, key mappings, and `Minecraft.getInstance()` in isolated client classes. Common class signatures, fields, and initialization must not force those classes to load. A `client` directory does not enforce isolation. Do not use `@OnlyIn` as an ordinary mod-side guard. `Dist.DEDICATED_SERVER` does not include the integrated server, so it cannot guard general server gameplay.

Common packet data/encoding classes may exist on both sides. Client application belongs in a separate client handler. Shared static mutable state is not client/server synchronization.

## Choose synchronization

| Need | First choice |
| --- | --- |
| Changing tracked entity fields | `SynchedEntityData` |
| Extra fixed spawn information | `IEntityAdditionalSpawnData` when needed |
| Block entity state on chunk load | Update tag |
| Block entity state after update | Update packet and notification |
| Open container inventory/small values | Slots and `ContainerData` |
| User request or specialized state | `SimpleChannel` message |

## Message contract

Use `net.minecraftforge.network.simple.SimpleChannel` and `NetworkRegistry.newSimpleChannel`. Register unique, deterministic IDs identically on both sides. Strict protocol equality is suitable when both sides require the mod; optional-client support needs a deliberate compatibility design.

An encoder consumes a message and buffer. A decoder takes a buffer and returns a message. A no-argument constructor is not required; Java 17 records can represent immutable data.

Partial C2S example, with application logic intentionally left to the feature:

```java
public record SelectModeC2S(int mode) {
    public static void encode(SelectModeC2S message, FriendlyByteBuf buffer) {
        buffer.writeVarInt(message.mode());
    }
    public static SelectModeC2S decode(FriendlyByteBuf buffer) {
        return new SelectModeC2S(buffer.readVarInt());
    }
    public static void handle(SelectModeC2S message,
            Supplier<NetworkEvent.Context> supplier) {
        NetworkEvent.Context context = supplier.get();
        context.enqueueWork(() -> {
            ServerPlayer sender = context.getSender();
            if (sender == null || message.mode() < 0 || message.mode() > 2) return;
            // Validate the active menu/held item and permission, then apply.
        });
        context.setPacketHandled(true);
    }
}
// Register once on an already-created channel; choose an unused ID.
channel.registerMessage(0, SelectModeC2S.class,
    SelectModeC2S::encode, SelectModeC2S::decode, SelectModeC2S::handle,
    Optional.of(NetworkDirection.PLAY_TO_SERVER));
```

The fragment uses `FriendlyByteBuf`, `ServerPlayer`, `NetworkEvent`, `NetworkDirection`, `java.util.Optional`, and `java.util.function.Supplier`. Define the channel/protocol separately.

## Validate requests

Take identity from `context.getSender()`. Validate permission, active menu or held item, dimension, target type, distance, and target lifetime. Before looking up a client-supplied position, check `level.hasChunkAt(pos)`. Bound numbers, strings, collections, and request frequency. Never trust a client-supplied recipe result, item reward, or energy balance.

Mutate the world on the server thread. APIs that already dispatch to the main thread do not need redundant scheduling; verify the selected registration method. S2C handlers use `PLAY_TO_CLIENT` and isolated client application, checking world/player availability and whether the message belongs to the current session.

Use player or tracking distributors for relevant recipients; reserve `ALL` for global state. Tracking an entity does not always include its own player connection. Choose the appropriate distributor when self-delivery matters. Use bounded batches or deltas for large state, not unbounded per-tick full snapshots.

Sources: [sides](https://docs.minecraftforge.net/en/1.20.1/concepts/sides/), [SimpleImpl](https://docs.minecraftforge.net/en/1.20.1/networking/simpleimpl/), [entity synchronization](https://docs.minecraftforge.net/en/1.20.1/networking/entities/).
