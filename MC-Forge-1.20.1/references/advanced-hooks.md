# Access Transformers and Mixin

Use extension points, events, and subclass overrides first when they meet the feature's requirements. Use an access transformer for an access change and Mixin for a precise behavior change when necessary.

## Access transformers

Place the configuration at `META-INF/accesstransformer.cfg` and wire it into the ForgeGradle project. Verify target names/descriptors in the exact mappings and Forge version. Check both development compilation and the packaged artifact; a development-only access change is insufficient.

## Mixin

Forge's runtime includes Mixin, but that does not configure a project's mixin JSON, annotation processing, refmap, or manifest entries. Inspect the project's existing setup and verify the build integration against the exact dependency before adding plugins. Do not invent plugin coordinates or apply another loader's metadata schema.

Keep targets narrow, document why an ordinary hook is insufficient, and verify descriptors, overloads, injection timing, and client/common placement. Avoid broad overwrites when a targeted injection or accessor meets the requirement. Do not assume constructor injections can freely mutate final fields; constructor timing, bytecode restrictions, and the selected injection type matter.

Test a remapped built JAR, not just an IDE run. On failure, inspect the first mixin target/application error and the actual target method, rather than disabling required injections until the game starts.

Sources: [access transformers](https://docs.minecraftforge.net/en/1.20.1/advanced/accesstransformers/), [Sponge Mixin documentation](https://github.com/SpongePowered/Mixin/wiki).
