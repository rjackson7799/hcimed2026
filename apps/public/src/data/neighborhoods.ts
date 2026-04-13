export interface Neighborhood {
  slug: string;
  name: string;
  description: string;
  distanceFromOffice: string;
  distanceMiles: number;
  directionsNote: string;
  highlights: string[];
  populationNote?: string;
  serviceEmphasis: ('internal-medicine' | 'senior-care' | 'wellness' | 'chronic-care' | 'remote-monitoring')[];
  googleMapsQuery: string;
}

export const neighborhoods: Neighborhood[] = [
  {
    slug: 'pasadena',
    name: 'Pasadena',
    description: 'HCI Medical Group has called Pasadena home since 1990. Located in the heart of the city at 65 N. Madison Avenue, we\'ve spent over three decades building relationships with our neighbors and providing trusted primary care to this vibrant community.',
    distanceFromOffice: 'Our location',
    distanceMiles: 0,
    directionsNote: 'We\'re located at 65 N. Madison Ave., Suite 709 — just blocks from Old Pasadena and easily accessible from the 210 and 134 freeways.',
    highlights: [
      'Home to the Rose Bowl and the annual Tournament of Roses',
      'A thriving arts and dining scene along Colorado Boulevard',
      'Strong community of families and retirees in established neighborhoods',
    ],
    populationNote: 'City of ~140,000 residents',
    serviceEmphasis: ['internal-medicine', 'senior-care', 'chronic-care', 'wellness'],
    googleMapsQuery: 'HCI+Medical+Group+65+N+Madison+Ave+Pasadena+CA',
  },
  {
    slug: 'altadena',
    name: 'Altadena',
    description: 'Nestled in the foothills above Pasadena, Altadena is a close-knit community with a mix of longtime residents and growing families. Many of our Altadena patients have been with HCI Medical Group for years, appreciating the short drive and personal care.',
    distanceFromOffice: '5 minutes',
    distanceMiles: 3.2,
    directionsNote: 'A quick drive south on Lake Avenue or Fair Oaks Avenue brings you directly to our office in central Pasadena.',
    highlights: [
      'Known for the historic Christmas Tree Lane on Santa Rosa Avenue',
      'Beautiful hiking access to the San Gabriel Mountains',
      'A growing community with deep roots and neighborhood character',
    ],
    populationNote: 'Community of ~43,000 residents',
    serviceEmphasis: ['senior-care', 'internal-medicine'],
    googleMapsQuery: 'Altadena+CA+to+65+N+Madison+Ave+Pasadena+CA',
  },
  {
    slug: 'south-pasadena',
    name: 'South Pasadena',
    description: 'South Pasadena is one of the San Gabriel Valley\'s most charming small cities, known for its tree-lined streets, excellent schools, and strong sense of community. Our practice is just minutes away, making it easy for South Pasadena families to get the care they need.',
    distanceFromOffice: '5 minutes',
    distanceMiles: 2.8,
    directionsNote: 'Head north on Fair Oaks Avenue — our office is a straight 5-minute drive into central Pasadena.',
    highlights: [
      'Award-winning school district and family-friendly neighborhoods',
      'Walkable downtown along Mission Street with local shops and cafes',
      'A tight-knit community that values long-term relationships — just like we do',
    ],
    populationNote: 'City of ~26,000 residents',
    serviceEmphasis: ['internal-medicine', 'wellness'],
    googleMapsQuery: 'South+Pasadena+CA+to+65+N+Madison+Ave+Pasadena+CA',
  },
  {
    slug: 'san-marino',
    name: 'San Marino',
    description: 'San Marino is a quiet, residential community known for the Huntington Library and beautifully maintained neighborhoods. We serve many San Marino patients and families who value continuity — seeing the same trusted doctor at every visit.',
    distanceFromOffice: '5 minutes',
    distanceMiles: 2.5,
    directionsNote: 'Take Huntington Drive or Sierra Madre Boulevard west to reach our Pasadena office in just a few minutes.',
    highlights: [
      'Home to The Huntington Library, Art Museum, and Botanical Gardens',
      'One of the safest and most desirable residential communities in the SGV',
      'Strong tradition of multigenerational families',
    ],
    populationNote: 'City of ~13,000 residents',
    serviceEmphasis: ['senior-care', 'internal-medicine'],
    googleMapsQuery: 'San+Marino+CA+to+65+N+Madison+Ave+Pasadena+CA',
  },
  {
    slug: 'arcadia',
    name: 'Arcadia',
    description: 'Arcadia is a thriving city in the heart of the San Gabriel Valley with a diverse community and excellent amenities. Residents enjoy easy access to our Pasadena office for comprehensive primary care and specialized senior services.',
    distanceFromOffice: '10 minutes',
    distanceMiles: 5.1,
    directionsNote: 'Take the 210 Freeway west to the Lake Avenue exit, or drive along Huntington Drive through San Marino for a scenic route.',
    highlights: [
      'Home to the Los Angeles County Arboretum and Santa Anita Park',
      'Excellent dining scene with a wide variety of cuisines',
      'A growing senior population that benefits from our specialized geriatric care',
    ],
    populationNote: 'City of ~57,000 residents',
    serviceEmphasis: ['senior-care', 'chronic-care'],
    googleMapsQuery: 'Arcadia+CA+to+65+N+Madison+Ave+Pasadena+CA',
  },
  {
    slug: 'sierra-madre',
    name: 'Sierra Madre',
    description: 'Sierra Madre is a small, peaceful foothill city where neighbors still know each other by name. Its residents appreciate our similarly personal approach to healthcare — taking time, listening, and treating the whole person.',
    distanceFromOffice: '10 minutes',
    distanceMiles: 4.8,
    directionsNote: 'Drive south on Baldwin Avenue to Sierra Madre Boulevard, then west into Pasadena. About 10 minutes door to door.',
    highlights: [
      'Famous for the annual Wistaria Festival and small-town Fourth of July parade',
      'Surrounded by the San Gabriel Mountains with exceptional trail access',
      'Close-knit community with a village atmosphere',
    ],
    populationNote: 'City of ~11,000 residents',
    serviceEmphasis: ['internal-medicine', 'wellness'],
    googleMapsQuery: 'Sierra+Madre+CA+to+65+N+Madison+Ave+Pasadena+CA',
  },
  {
    slug: 'la-canada-flintridge',
    name: 'La Cañada Flintridge',
    description: 'La Cañada Flintridge sits along the western edge of the San Gabriel Mountains, known for its top-rated schools and beautiful residential neighborhoods. Our Pasadena office is conveniently accessible via the 210 Freeway.',
    distanceFromOffice: '15 minutes',
    distanceMiles: 7.2,
    directionsNote: 'Take the 210 Freeway east to the Lake Avenue exit. Our office is just minutes from the freeway.',
    highlights: [
      'Home to Descanso Gardens and NASA\'s Jet Propulsion Laboratory',
      'Top-rated La Cañada Unified School District',
      'Scenic hillside neighborhoods with a suburban feel close to the city',
    ],
    populationNote: 'City of ~20,000 residents',
    serviceEmphasis: ['internal-medicine', 'senior-care'],
    googleMapsQuery: 'La+Canada+Flintridge+CA+to+65+N+Madison+Ave+Pasadena+CA',
  },
  {
    slug: 'monrovia',
    name: 'Monrovia',
    description: 'Monrovia has experienced a wonderful revival in recent years, with a vibrant Old Town district and a strong community spirit. Patients from Monrovia appreciate our personalized approach and the ease of reaching our Pasadena office.',
    distanceFromOffice: '15 minutes',
    distanceMiles: 8.4,
    directionsNote: 'Take the 210 Freeway west to Lake Avenue, or drive along Foothill Boulevard through Arcadia for a direct route.',
    highlights: [
      'Charming Old Town Monrovia with independent shops and restaurants',
      'Beautiful Monrovia Canyon Park with waterfalls and hiking trails',
      'Active senior community and growing family neighborhoods',
    ],
    populationNote: 'City of ~38,000 residents',
    serviceEmphasis: ['senior-care', 'remote-monitoring'],
    googleMapsQuery: 'Monrovia+CA+to+65+N+Madison+Ave+Pasadena+CA',
  },
  {
    slug: 'temple-city',
    name: 'Temple City',
    description: 'Temple City is a welcoming, diverse community in the San Gabriel Valley known for its Camellia Festival and strong neighborhood identity. Our Pasadena office is a short drive away, offering comprehensive care for the whole family.',
    distanceFromOffice: '15 minutes',
    distanceMiles: 6.9,
    directionsNote: 'Drive north on Rosemead Boulevard to the 210 Freeway, or take Las Tunas Drive west through San Gabriel and South Pasadena.',
    highlights: [
      'Known as the "Home of the Camellia" — celebrating the annual Camellia Festival since 1944',
      'Diverse, family-oriented community with excellent local dining',
      'Convenient access to Pasadena via multiple routes',
    ],
    populationNote: 'City of ~36,000 residents',
    serviceEmphasis: ['internal-medicine', 'chronic-care'],
    googleMapsQuery: 'Temple+City+CA+to+65+N+Madison+Ave+Pasadena+CA',
  },
  {
    slug: 'glendale',
    name: 'Glendale',
    description: 'Glendale is one of the largest cities in the San Gabriel Valley, with a vibrant cultural scene and a diverse population. While a bit farther from our office, many Glendale residents choose HCI Medical Group for our continuity of care and personal attention.',
    distanceFromOffice: '20 minutes',
    distanceMiles: 10.3,
    directionsNote: 'Take the 134 Freeway east — it connects directly to Pasadena. Our office is just minutes from the freeway exit.',
    highlights: [
      'The Americana at Brand and Glendale Galleria shopping destinations',
      'Diverse cultural community with a strong Armenian and Korean heritage',
      'Forest Lawn Memorial Park and the Verdugo Mountains for outdoor recreation',
    ],
    populationNote: 'City of ~196,000 residents',
    serviceEmphasis: ['internal-medicine', 'senior-care'],
    googleMapsQuery: 'Glendale+CA+to+65+N+Madison+Ave+Pasadena+CA',
  },
];

export function getNeighborhoodBySlug(slug: string): Neighborhood | undefined {
  return neighborhoods.find((n) => n.slug === slug);
}
