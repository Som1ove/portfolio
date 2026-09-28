import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/portfolio/',
  publicDir: 'public-site',
  plugins: [react()],
});
