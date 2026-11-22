import { defineConfig, envField } from 'astro/config';
import llmsTxt from './integrations/llms-txt.mjs';
import { MARKA } from './src/config/marka.mjs';

export default defineConfig({
  // Adres bazowy z jednego źródła danych marki (src/config/marka.mjs).
  site: MARKA.url,
  output: 'static',
  trailingSlash: 'never',
  compressHTML: false,
  build: { format: 'file' },
  // Publiczny klucz witryny Turnstile. Brak albo pusta wartość = build bez formularza (wariant mailto);
  // format niepustej wartości sprawdza src/config/kontakt.ts.
  env: {
    schema: {
      PUBLIC_TURNSTILE_SITEKEY: envField.string({ context: 'client', access: 'public', optional: true, max: 64 }),
    },
  },
  integrations: [llmsTxt()],
});
