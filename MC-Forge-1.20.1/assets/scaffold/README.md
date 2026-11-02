# Forge 1.20.1 Java Template

A minimal block/item project for Java 17 and Forge 47.4.10. It uses the existing package's Gradle 8.5 wrapper and Parchment `2023.09.03-1.20.1`. ForgeGradle and Librarian plugin selectors are inherited ranges, not reproducibility locks. Record resolved plugin versions when reproducing a build.

The template includes a block, its item, an ordinary item, creative-tab placement, English names, vanilla-texture models, a block loot table, a pickaxe tag, a simple recipe, and a recipe-unlock advancement. It contains no client-only Java classes and no dependency on a third-party gameplay mod.

## Customize

Copy the directory to an empty project, update `gradle.properties`, change `ExampleMod.MOD_ID` and Java package names, and rename resource namespaces and embedded IDs. Dependency owner tables expand from `mod_id`. Set the intended license; the default is not a license grant for another author's code.

The 47.4.10 baseline uses a context-taking mod constructor. Do not lower the Forge dependency floor without checking that API and testing the alternate version. Minecraft compatibility is exactly 1.20.1. The wrapper is inherited from the original package, not represented as an untouched official MDK.

## Verify

Run the package's static checker against this directory, then `.\gradlew.bat build` on Windows or `./gradlew build` on Unix. Use `runClient` to inspect the example, and `runServer` in a disposable world for dedicated-server checks. Server EULA acceptance is a user decision.

`runData` is configured and `src/generated/resources` is included, but no data providers or GameTests are included. Hand-written resources are the source of truth until providers are deliberately introduced. Do not create generated duplicates of these files.

For in-game inspection, find the example block under Building Blocks and the example item under Ingredients. One stone crafts an example block. The example block requires a pickaxe but no additional tier restriction. It uses vanilla stone and iron-ingot textures intentionally.

See the package's validation record for checks actually completed; configuration alone does not establish a successful build or game launch.
