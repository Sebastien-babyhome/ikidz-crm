import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Charge toutes les variables d'environnement dans process.env pour les
// routes serveur pendant le développement. Seules les variables VITE_* sont
// intégrées au bundle client (comportement standard de Vite).
const serverEnv = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Entrée serveur : src/server.ts (page d'erreur SSR maison).
      server: { entry: "server" },
      // Interdit d'importer du code serveur dans le bundle navigateur.
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    // Build : serveur Node autonome dans .output/server/index.mjs (Clever Cloud).
    ...(command === "build" ? [nitro({ preset: "node-server" })] : []),
    viteReact(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // Force la copie hoisted v4.5.0 d'entities (la copie imbriquée v7
      // casse le SSR : ./lib/decode.js a été supprimée).
      "entities/lib/decode.js": path.resolve(
        import.meta.dirname,
        "node_modules/entities/lib/decode.js",
      ),
      "entities/lib/encode.js": path.resolve(
        import.meta.dirname,
        "node_modules/entities/lib/encode.js",
      ),
      entities: path.resolve(import.meta.dirname, "node_modules/entities"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  server: { host: "::", port: 8080 },
}));
