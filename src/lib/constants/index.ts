export const SITE_CONFIG = {
  name: 'JapanStroj',
  description: 'Vaš pouzdan partner za rezervne dijelove građevinskih strojeva',
  url: 'https://japanstroj.ba',
  ogImage: '/hero.jpg',
};

export const CONTACT_INFO = {
  phone: '+387 61 924 848',
  phoneClean: '38761924848',
  email: 'info@japanstroj.ba',
  address: 'Ulica 123, Grad, Država',
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