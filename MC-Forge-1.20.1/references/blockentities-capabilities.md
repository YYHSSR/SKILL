# Block Entities and Capabilities

## Lifecycle

Register a `BlockEntityType` with its valid blocks, construct instances with position/state, and use `EntityBlock` or an appropriate base class. Do not access a level before attachment. Return a ticker only for the correct type. Processing, energy use, and output generation belong on the logical server; a separate client animation ticker is valid.

## Persistence and synchronization

Persist fields through `saveAdditional(CompoundTag)` and `load(CompoundTag)`, calling superclass methods. Call `setChanged()` after persistent server state changes. Preserve reserved tags and provide safe defaults for old or incomplete saves.

| Purpose | Mechanism |
| --- | --- |
| Save/load | `saveAdditional`, `load` |
| Mark storage dirty | `setChanged()` |
| Initial client state | `getUpdateTag`, `handleUpdateTag` |
| Block update synchronization | `getUpdatePacket`, packet application, `sendBlockUpdated` |
| Open-menu state | Slots and `ContainerData` |

An update tag does not continually broadcast progress. For block updates, return `ClientboundBlockEntityDataPacket.create(this)` and notify clients from the server using `level.sendBlockUpdated` with `Block.UPDATE_CLIENTS`. Decide whether default packet application through `load` suits the transmitted tag. Send only visible state and avoid broadcasting whole inventories per tick.

## Capabilities

Reuse `ForgeCapabilities.ITEM_HANDLER`, `FLUID_HANDLER`, or `ENERGY` when suitable. Owned block entities expose interfaces through `getCapability`. Attach to foreign objects with `AttachCapabilitiesEvent`; subscribe using its supported base type and narrow inside the handler.

Cache each `LazyOptional`, invalidate it when its provider ends, and return `super.getCapability` for unrelated queries. Owned block entities use `invalidateCaps` and recreate invalidated wrappers in `reviveCaps` if revival is supported. Attached providers register an invalidation listener with the attachment event.

Custom capability interfaces use `RegisterCapabilitiesEvent` or `@AutoRegisterCapability`. Registration, providers, serialization, lifecycle, and networking are separate tasks. Capabilities do not automatically synchronize to clients.

Player data needs an explicit death/clone/respawn/login/dimension policy. In `PlayerEvent.Clone`, distinguish death from other cloning and account for the original provider's lifecycle when accessing its capability. Do not blindly duplicate state on every clone.

## Machines

Use `ItemStackHandler#onContentsChanged` to mark inventory changes dirty. Respect side-dependent insertion/extraction. Simulation must never mutate storage. Energy transfer must respect capacity/transfer limits and dirty state only after real changes.

For multiblocks, choose a controller that owns storage. Track membership, validate loaded neighbors, invalidate on structural changes, and limit rescans. Avoid forcing chunk loads. Define content recovery when the controller breaks.

Sources: [block entities](https://docs.minecraftforge.net/en/1.20.1/blockentities/), [capabilities](https://docs.minecraftforge.net/en/1.20.1/datastorage/capabilities/).
