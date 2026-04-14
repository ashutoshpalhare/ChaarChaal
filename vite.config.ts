import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
});
// TODO: refine vite.config.ts layout spacing

      <button className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500">
        Action
      </button>
// state update 16
