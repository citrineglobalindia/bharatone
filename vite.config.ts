// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Vercel deployment config:
// - cloudflare: false disables the Cloudflare Workers build plugin so we get a portable build.
// - tanstackStart.spa.enabled: true tells TanStack Start to build as a Single Page App
//   (client-only, no SSR server bundle, just prerendered index.html + JS).
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: { enabled: true },
    server: { entry: "server" },
  },
});
