import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/football-data': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/football-data/, ''),
      },
      '/api/api-football': {
        target: 'https://v3.football.api-sports.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/api-football/, ''),
      },
    },
  },
});
