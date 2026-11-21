'use strict';
/* Punkt wejścia dla `node --test tools/tests/` (Node 22 traktuje katalog jak moduł i ładuje ten plik).
   Ładuje wszystkie pliki *.test.cjs z tego katalogu; można je też uruchamiać pojedynczo. */
const fs = require('node:fs');
const path = require('node:path');

for (const f of fs.readdirSync(__dirname).filter((x) => x.endsWith('.test.cjs')).sort()) {
  require(path.join(__dirname, f));
}
