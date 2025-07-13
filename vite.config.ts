// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  /* 👇  the important part */
  resolve: {
    alias: [
      {
        // “@mui/material/Box/index.js”  ➜  “@mui/material/Box”
        find: /^@mui\/material\/([^/]+)\/index\.js$/,
        replacement: "@mui/material/$1",
      },
    ],
  },
});
