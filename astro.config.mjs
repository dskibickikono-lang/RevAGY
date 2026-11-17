import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://revagy.pl',
  output: 'static',
  trailingSlash: 'never',
  compressHTML: false,
  build: { format: 'file' },
});
