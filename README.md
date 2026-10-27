# An already loaded async module cannot acquire an unchanged, unloaded dependency

Standalone reproduction with **unmodified webpack 5.112.2**, Node.js 22 or newer. No Rspack patches, runtime monkey-patching, dev server, framework, or browser reload fallback.

## Run

```sh
npm ci
npm test
npm run test:control
```

`npm test` asserts the desired behavior and is expected to **exit 1 on the affected version**. The control is expected to exit 0. Each invocation recreates only the gitignored `.work/` directory; tracked source files are unchanged.

## Scenario

Load `page` once, but never call the `other` import. `other` already depends on dep, which is forced into a separate shared chunk. Edit the loaded page to require that same, unchanged dep, without calling the page import again.

The starting files are in [src](src); [steps](steps) contains the exact edits. [reproduce.cjs](reproduce.cjs) performs those edits and applies HMR. The small [harness](harness.cjs) uses webpack's public Node API, persisting compilation records between successive builds, then executes webpack's real emitted runtime.

## Actual and expected behavior

The loaded page self-accepts before the newly required shared factory is available. The ordinary import ensure path is not rerun merely because page self-accepts. The cache group is explicitly enforced; this does not claim default minChunks would extract a single-use module.

The assertions express the expected result. See [observed.json](observed.json) for the captured failing run and [control.json](control.json) for its successful control. Generated chunks and update files are left in `.work/dist/`; each run also writes `results/last-run.json` with the compilation hashes, chunk/module membership, manifests, and result.

## Control

Disable splitChunks. The existing page hot-update can supply the dependency factory.

## Scope

Verified on 2026-10-28. HMR compiler and JavaScript HMR runtime files in the npm release match webpack main commit `bd8eddff945733f65ada91ad441ce8b613f1544a` byte-for-byte. This is **not** a claim that every file or target on main was tested.
