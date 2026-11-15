# Living Universe RC2 source transfer manifest

The authoritative files below were verified from the local `living-universe-rc2-parity-verified.zip` package. This is **transfer metadata only**, not a claim that the source is already committed.

| Destination in PR #34 | Bytes | SHA-256 |
|---|---:|---|
| `living-universe-full.html` | 188366 | `d49b9fe27e763eabc86e7ce654262a9a6e7190c5344cd88d5e6238dbabb59209` |
| `source/src/data.js` | 40407 | `2f3a0ac8dd112f2742bf2f53d6705754307e9e8620faecf9031becf55410f8d8` |
| `source/src/app-core.js` | 28599 | `210ee3f28180fee0a0342da107c7d3a9fdb648e82f9158e0d52e26e65825ccb3` |
| `source/src/app-ui.js` | 41177 | `03bd6ffeceabf89c36f240c865f41b5197fd24bcacf7b1cca42d820e0518aabe` |
| `source/src/engine.js` | 12953 | `2f1cd9c5939497565b97ce126bd151409f99f4dfd086a528bf72ce8884f533b1` |
| `source/src/index.tpl.html` | 10625 | `68ddb24039ca38f33136b354348d9bbfbebd9ef018497c86ab8219b163f52365` |
| `source/src/style.css` | 19874 | `1c0a6db7b9a9f945f77059de1cf91deccbd933a018412a3200df12876be6ace2` |
| `source/src/tree.js` | 7733 | `14ccd4585cc8ec895e82d5735533c1d6b286ca98916a49e37e81774d23035ad7` |
| `source/src/worlds.js` | 27014 | `3705a6b1f154eea96e52a9ad38a61824e022a8b761818095189acd40a0906064` |

The packaged `source/dist/index.html` is byte-for-byte identical to the standalone HTML. Commit the complete package's build script, tests, validation scripts and documentation as well.

## Required next action

1. Transfer the files from the actual local ZIP to the existing draft branch, preserving bytes and paths.
2. Compare SHA-256 of each committed file with the manifest.
3. Run the source tests and exact-head CI.
4. Run real-browser desktop and Android acceptance and compare against original.
5. Do not merge or deploy until those steps succeed.

**Do not copy the smaller `living-universe-3.html` prototype in place of the full application.**
