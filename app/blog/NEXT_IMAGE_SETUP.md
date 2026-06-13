# next/image setup (required)

The exported pages use `next/image`. Add these remote image hosts to your
app's `next.config` under `images.remotePatterns`, or merge the generated
`next.config.imagekit.mjs` in this folder:

- `ik.imagekit.io`
- `writequeryhook.com`

Without this, `next/image` throws at runtime for remote images.
