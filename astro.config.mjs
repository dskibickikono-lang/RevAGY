import { defineConfig } from 'astro/config';
import llmsTxt from './integrations/llms-txt.mjs';

export default defineConfig({
  site: 'https://revagy.pl',
  output: 'static',
  trailingSlash: 'never',
  compressHTML: false,
  build: { format: 'file' },
  integrations: [llmsTxt()],
});
