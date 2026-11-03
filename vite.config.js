import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // "./" makes the built site work under any GitHub Pages address
  // (https://USERNAME.github.io/REPO-NAME/) without typing the repo name.
  base: "./",
});
