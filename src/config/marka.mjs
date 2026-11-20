// Jedno źródło danych marki REVAGY: dane strukturalne (JSON-LD) w BaseLayout
// i nagłówek plików llms.txt / llms-full.txt (integrations/llms-txt.mjs).
// Dane rejestrowe muszą być zgodne ze stopką w BaseLayout.astro (D-007).
// Plik .mjs, a nie .ts, bo czyta go też astro.config.mjs.

export const MARKA = {
  nazwa: 'REVAGY',
  url: 'https://revagy.pl/',
  opis:
    'REVAGY automatyzuje procesy i wdraża AI w firmach B2B: kadry, rekrutację, sprzedaż i operacje. ' +
    'Łączy istniejące systemy (CRM, ERP, systemy kadrowe, skrzynki pocztowe) w jeden obieg, bez wymiany systemów.',
  email: 'kontakt@revagy.pl',
  wlasciciel: 'Dawid Skibicki',
  nip: '7441749535',
  regon: '389229155',
  adres: {
    ulica: 'ul. Gabriela Narutowicza 7/7',
    kod: '14-200',
    miasto: 'Iława',
    kraj: 'PL',
  },
  logo: 'https://revagy.pl/assets/img/icon-512.png',
  obraz: 'https://revagy.pl/assets/img/og.jpg',
  // Profile marki poza stroną (D-011). Dopisuj tylko oficjalne profile REVAGY.
  profile: ['https://www.linkedin.com/company/revagy/'],
  tematy: [
    'automatyzacja procesów biznesowych',
    'wdrożenia AI w firmach B2B',
    'integracje CRM i ERP',
    'automatyzacja kadr i rekrutacji',
    'automatyzacja dla agencji pracy',
    'obieg dokumentów',
  ],
};

export function grafOrganizacji(m = MARKA) {
  const org = `${m.url}#organizacja`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': org,
        name: m.nazwa,
        url: m.url,
        description: m.opis,
        email: m.email,
        logo: { '@type': 'ImageObject', url: m.logo, width: 512, height: 512 },
        image: m.obraz,
        taxID: m.nip,
        identifier: [{ '@type': 'PropertyValue', propertyID: 'REGON', value: m.regon }],
        address: {
          '@type': 'PostalAddress',
          streetAddress: m.adres.ulica,
          postalCode: m.adres.kod,
          addressLocality: m.adres.miasto,
          addressCountry: m.adres.kraj,
        },
        founder: { '@type': 'Person', name: m.wlasciciel },
        areaServed: { '@type': 'Country', name: 'Polska' },
        knowsAbout: m.tematy,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: m.email,
          availableLanguage: ['pl'],
        },
        sameAs: m.profile,
      },
      {
        '@type': 'WebSite',
        '@id': `${m.url}#strona`,
        url: m.url,
        name: m.nazwa,
        inLanguage: 'pl-PL',
        publisher: { '@id': org },
      },
    ],
  };
}

// JSON bezpieczny do osadzenia w <script>: znaki < > & jako < itd.,
// żeby treść nigdy nie zamknęła bloku ani nie otworzyła komentarza HTML.
export function jsonDoSkryptu(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
