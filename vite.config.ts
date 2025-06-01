import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [
          [
            "@babel/plugin-proposal-decorators",
            {
              version: "2023-05",
            },
          ],
        ],
      },
    }),
    checker({
      typescript: true,
    }),
  ],
  build: {
    outDir: "dist",
  },
  esbuild: {
    target: command === "build" ? ["es2020"] : ["es2020"],
  },
  server: {
    open: true,
  },
}));
