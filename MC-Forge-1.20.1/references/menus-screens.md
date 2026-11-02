# Menus, Screens, and Input

## Ownership

`AbstractContainerMenu` exists on both logical sides and defines slots, synchronized values, transfers, and validity. `AbstractContainerScreen` is a client view. Server inventory and crafting state remain authoritative.

Register `MenuType` on the mod bus. If opening requires extra data, use `IForgeMenuType.create` and matching buffer-based creation. Open through `NetworkHooks.openScreen` from a `ServerPlayer`, with the same field order on writer and reader.

Server constructors use real storage; client constructors use storage/data with matching dimensions. Do not depend on an unchecked client block entity lookup. Validate access through `stillValid`, distance, and appropriate `ContainerLevelAccess`.

Register `MenuScreens.register` inside `FMLClientSetupEvent#enqueueWork` in an isolated client mod subscriber. Common initialization must not reference the screen class.

## Transfers and data

In `quickMoveStack`, validate the index, copy the original stack, route by origin and allowed destination, call `moveItemStackTo`, and update empty/changed source slots and `onTake`. Define named half-open ranges for machine, inventory, and hotbar slots. Return `ItemStack.EMPTY` when no transfer occurred. Test full destinations, filtered slots, output slots, and both transfer directions.

`ContainerData`/`DataSlot` transport uses a signed 16-bit value per slot in this target. Split larger integers into halves with masks or use a bounded custom packet. Keep counts and index meanings identical on both sides; rendering must tolerate zero maxima and initial placeholder values.

Buttons issue requests checked against the active server menu/container ID. Do not execute recipes or mutate storage in screen callbacks.

## Rendering and keys

Use 1.20.1 `GuiGraphics`, calculate offsets after initialization, and verify GUI scaling, resizing, tooltips, focus, and escape behavior. Register keys through `RegisterKeyMappingsEvent` on the client mod bus. Consume presses in an appropriate client event; gameplay actions send validated server requests.

Sources: [menus](https://docs.minecraftforge.net/en/1.20.1/gui/menus/), [screens](https://docs.minecraftforge.net/en/1.20.1/gui/screens/), [key mappings](https://docs.minecraftforge.net/en/1.20.1/misc/keymappings/).
