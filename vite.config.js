import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        open: true
    },
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/, // Processes both .js and .jsx
    },

})