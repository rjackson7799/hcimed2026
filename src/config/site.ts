export const siteConfig = {
  name: 'HCI Medical Group',
  url: 'https://hcimed.com',
  tagline: 'Your Pasadena Doctors Since 1990',
  description: 'For over 35 years, HCI Medical Group has provided trusted internal medicine and senior care to Pasadena families.',
  foundedYear: 1990,

  contact: {
    phone: '(626) 792-4185',
    phoneRaw: '6267924185',
    email: 'care@hcimed.com',
    fax: '(626) 792-4186',
  },

  address: {
    street: '65 N. Madison Ave.',
    suite: 'Suite #709',
    city: 'Pasadena',
    state: 'CA',
    zip: '91101',
    full: '65 N. Madison Ave. #709, Pasadena, CA 91101',
  },

  hours: {
    weekdays: 'Mon - Fri: 9AM - 5PM',
    saturday: 'Closed',
    sunday: 'Closed',
  },

  social: {
    facebook: '',
    twitter: '',
    linkedin: '',
  },

  links: {
    patientPortal: 'https://www.healow.com/apps/practice/hci-medical-group-inc-24741?v=2',
    appointments: '/appointments',
  },

  maps: {
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3302.123456789!2d-118.14892!3d34.14751!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c35a0d5e1a1b%3A0x1234567890abcdef!2s65%20N%20Madison%20Ave%2C%20Pasadena%2C%20CA%2091101!5e0!3m2!1sen!2sus!4v1234567890',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=65+N+Madison+Ave+Pasadena+CA+91101',
  },
} as const;

export type SiteConfig = typeof siteConfig;
