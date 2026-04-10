import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use repo path in production for GitHub Pages project site.
  base: command === "serve" ? "/" : "/Studex2.0/",
}));
