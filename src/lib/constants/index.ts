export const SITE_CONFIG = {
  name: 'JapanStroj',
  description: 'Vaš pouzdan partner za rezervne dijelove građevinskih strojeva',
  url: 'https://japanstroj.ba',
  ogImage: '/hero.jpg',
};

export const CONTACT_INFO = {
  phone: '+387 61 936 935',
  phoneClean: '38761936935',
  phoneInternational: '+38761936935',
  secondaryPhone: '+387 032 740',
  secondaryPhoneClean: '387032740',
  email: 'kontakt@japanstroj.com',
  displayEmail: 'Kontakt@japanstroj.com',
  address: 'Vareš, Zvijezda 32, Vareš',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Vare%C5%A1%2C%20Zvijezda%2032%2C%20Vare%C5%A1',
  facebookUrl: 'https://www.facebook.com/share/1C7UZGuvCV/',
  olxUrl: 'https://olx.ba/profil/japanstroj',
};

export const BUSINESS_RULES = {
  vatRate: 0.17,
  bulkDiscounts: {
    tier1: { threshold: 2000, discount: 0.03 }, // 3% off orders >= 2000 BAM
    tier2: { threshold: 5000, discount: 0.05 }, // 5% off orders >= 5000 BAM
  },
};

export const UI_CONFIG = {
  primaryColor: '#ff6b00',
  secondaryColor: '#ff7f1a',
  backgroundColor: '#0b0b0b',
  cardBackground: '#101010',
  textColor: '#ffffff',
  textSecondary: '#a1a1aa',
};
