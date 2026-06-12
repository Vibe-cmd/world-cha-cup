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
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-Auth-Token', process.env.VITE_FOOTBALL_DATA_API_KEY || '');
          });
        },
      },
      '/api/api-football': {
        target: 'https://v3.football.api-sports.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/api-football/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-apisports-key', process.env.VITE_API_FOOTBALL_KEY || '');
          });
        },
      },
    },
  },
});
