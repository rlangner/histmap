import { HistoricalEvent } from '../types/historical';

export const INITIAL_HISTORICAL_EVENTS: HistoricalEvent[] = [
  // 1. Ancient Stonehenge (No Defined Start Date -> c. 1500 BCE)
  {
    id: 'stonehenge-monument',
    title: 'Stonehenge Construction Phase',
    notes: 'Prehistoric megalithic monument on Salisbury Plain in Wiltshire, England. Constructed in stages beginning from unknown Neolithic origins and active ceremonial use until the Bronze Age.',
    color: '#8b5cf6',
    category: 'Other',
    hasNoStartDate: true,
    endDate: {
      year: -1500,
      precision: 'century',
      isCirca: true,
      label: 'c. 1500 BCE'
    },
    geometry: {
      type: 'point',
      point: [51.1789, -1.8262] // Salisbury Plain, UK
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Prehistory', 'Monuments', 'Megaliths']
  },

  // 2. Ancient Egyptian New Kingdom (c. 1550 BCE - 1077 BCE) - Polygon
  {
    id: 'egyptian-new-kingdom',
    title: 'Egyptian New Kingdom',
    notes: 'The golden age of Ancient Egypt, spanning the 18th, 19th, and 20th Dynasties. Renowned for pharaohs like Hatshepsut, Akhenaten, Tutankhamun, and Ramesses II, expanding territorial reach from Nubia into the Levant.',
    color: '#eab308',
    category: 'Exodus',
    startDate: {
      year: -1550,
      precision: 'century',
      isCirca: true,
      label: 'c. 1550 BCE'
    },
    endDate: {
      year: -1077,
      precision: 'century',
      isCirca: true,
      label: 'c. 1077 BCE'
    },
    geometry: {
      type: 'polygon',
      polygon: [
        [31.6, 29.8], // Alexandria / Delta west
        [31.8, 32.5], // Port Said
        [33.5, 35.5], // Levant coast (Byblos)
        [34.5, 36.5], // Kadesh / Syria reach
        [31.0, 35.0], // Sinai / Negev
        [24.0, 35.5], // Red Sea coast Egypt
        [19.0, 37.0], // Nubian Red Sea
        [18.5, 31.0], // Dongola / 4th Cataract
        [24.0, 30.0], // Western Desert border
        [29.0, 29.5]  // Fayum / Lower Nile
      ]
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Egypt', 'Pharaohs', 'Bronze Age']
  },

  // 3. Battle of Marathon (August 12, 490 BCE) - Point (Day resolution)
  {
    id: 'battle-of-marathon',
    title: 'Battle of Marathon',
    notes: 'Decisive Greek victory by Athenian and Plataean hoplites under Miltiades against the first Persian invasion of Greece commanded by Datis and Artaphernes.',
    color: '#ef4444',
    category: 'Other',
    startDate: {
      year: -490,
      month: 8,
      day: 12,
      precision: 'day',
      label: 'August 12, 490 BCE'
    },
    geometry: {
      type: 'point',
      point: [38.1524, 23.9622] // Marathon, Greece
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Ancient Greece', 'Persian Wars', 'Athens']
  },

  // 4. The Silk Road Trade Route (130 BCE – 1453 CE) - Path
  {
    id: 'silk-road-network',
    title: 'The Great Silk Road',
    notes: 'Vast network of Eurasian trade routes active from the Han dynasty until the Ottoman boycott of trade with the West in 1453. Spurred economic, cultural, and religious transmission between East Asia, the Middle East, and the Mediterranean.',
    color: '#f97316',
    category: 'Other',
    startDate: {
      year: -130,
      precision: 'year',
      label: '130 BCE'
    },
    endDate: {
      year: 1453,
      precision: 'year',
      label: '1453 CE'
    },
    geometry: {
      type: 'path',
      path: [
        [34.3416, 108.9398], // Chang'an (Xi'an, China)
        [36.0611, 103.8343], // Lanzhou
        [40.1421, 94.6620],  // Dunhuang
        [39.4677, 75.9898],  // Kashgar
        [39.6542, 66.9597],  // Samarkand (Uzbekistan)
        [37.9601, 58.3261],  // Merv (Turkmenistan)
        [35.6892, 51.3890],  // Rayy / Tehran (Persia)
        [36.2021, 37.1343],  // Aleppo (Syria)
        [41.0082, 28.9784]   // Constantinople (Istanbul)
      ]
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Trade', 'Caravans', 'Asia', 'Europe']
  },

  // 5. Roman Empire (Peak Extent: 27 BCE – 476 CE) - Polygon
  {
    id: 'roman-empire-peak',
    title: 'Roman Empire (Height under Trajan)',
    notes: 'The post-Republican period of ancient Rome. At its height under Trajan in 117 CE, it spanned Western Europe, the Mediterranean, parts of Britain, North Africa, and the Near East with roughly 50 to 70 million inhabitants.',
    color: '#dc2626',
    category: 'David y Solomon',
    startDate: {
      year: -27,
      precision: 'year',
      label: '27 BCE'
    },
    endDate: {
      year: 476,
      precision: 'year',
      label: '476 CE (Western collapse)'
    },
    geometry: {
      type: 'polygon',
      polygon: [
        [54.9, -2.5],  // Hadrian's Wall, Britain
        [51.2, 3.2],   // Low Countries
        [49.5, 8.5],   // Rhine border (Germania Superior)
        [45.0, 19.0],  // Danube (Pannonia)
        [44.5, 28.5],  // Black Sea (Moesia / Dacia)
        [41.0, 39.5],  // Pontus / Anatolia
        [36.5, 42.0],  // Mesopotamia (Trajan conquest)
        [31.5, 35.5],  // Judea / Arabia Petraea
        [30.0, 31.2],  // Egypt (Nile Delta)
        [32.5, 13.5],  // Tripolitania (Libya)
        [36.5, 3.0],   // Mauretania (Algeria)
        [35.8, -5.3],  // Straits of Gibraltar
        [38.7, -9.1],  // Lusitania (Lisbon)
        [43.5, -8.3],  // Gallaecia (NW Spain)
        [49.0, -1.5]   // Normandy / Channel coast
      ]
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Rome', 'Emperors', 'Antiquity']
  },

  // 6. Battle of Hastings (October 14, 1066 CE) - Point (Day resolution)
  {
    id: 'battle-of-hastings',
    title: 'Battle of Hastings',
    notes: 'Fought between the Norman-French army of Duke William II of Normandy and an Anglo-Saxon army under King Harold Godwinson, beginning the Norman Conquest of England.',
    color: '#0284c7',
    category: 'Other',
    startDate: {
      year: 1066,
      month: 10,
      day: 14,
      precision: 'day',
      label: 'October 14, 1066'
    },
    geometry: {
      type: 'point',
      point: [50.9144, 0.4875] // Battle Abbey, East Sussex
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Normans', 'England', 'Medieval']
  },

  // 7. Ferdinand Magellan Circumnavigation (1519 - 1522 CE) - Path
  {
    id: 'magellan-circumnavigation',
    title: 'Magellan-Elcano Circumnavigation',
    notes: 'The first recorded voyage around the Earth. Commanded by Ferdinand Magellan and completed by Juan Sebastián Elcano aboard the Victoria, proving the ocean continuity of the globe.',
    color: '#0d9488',
    category: 'Other',
    startDate: {
      year: 1519,
      month: 9,
      day: 20,
      precision: 'day',
      label: 'September 20, 1519'
    },
    endDate: {
      year: 1522,
      month: 9,
      day: 6,
      precision: 'day',
      label: 'September 6, 1522'
    },
    geometry: {
      type: 'path',
      path: [
        [37.3891, -5.9845],   // Sanlúcar de Barrameda / Seville, Spain
        [28.2916, -16.6291],  // Canary Islands
        [-22.9068, -43.1729], // Rio de Janeiro, Brazil
        [-52.5, -69.5],       // Strait of Magellan (Cape Horn)
        [-10.0, -140.0],      // South Pacific crossing
        [10.3157, 123.8854],  // Mactan / Cebu, Philippines (Magellan killed)
        [8.5, 117.5],         // Palawan / Moluccas (Spice Islands)
        [-34.3568, 18.4722],  // Cape of Good Hope, South Africa
        [16.8500, -25.0000],  // Cape Verde Islands
        [37.3891, -5.9845]    // Return to Spain
      ]
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Exploration', 'Maritime', 'Age of Discovery']
  },

  // 8. United States of America (July 4, 1776 – Present / Ongoing) - Ongoing
  {
    id: 'united-states-nation',
    title: 'United States of America',
    notes: 'Founded with the Declaration of Independence on July 4, 1776, from thirteen British colonies, evolving into a federal republic spanning North America.',
    color: '#3b82f6',
    category: 'Other',
    startDate: {
      year: 1776,
      month: 7,
      day: 4,
      precision: 'day',
      label: 'July 4, 1776'
    },
    isOngoing: true,
    geometry: {
      type: 'polygon',
      polygon: [
        [48.99, -122.75], // Blaine, WA
        [49.00, -95.15],  // Lake of the Woods, MN
        [47.45, -84.45],  // Great Lakes
        [45.00, -71.50],  // Maine / Canada border
        [44.50, -66.95],  // Eastport, ME
        [25.10, -80.40],  // Florida Keys
        [29.75, -85.00],  // Gulf Coast
        [26.00, -97.15],  // Brownsville, TX
        [31.33, -111.00], // Nogales, AZ
        [32.53, -117.12], // San Diego, CA
        [48.38, -124.73]  // Cape Flattery, WA
      ]
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['USA', 'Democracy', 'Modern']
  },

  // 9. Battle of Waterloo (June 18, 1815 CE: 11:30 to 21:00) - Fine Hour Resolution!
  {
    id: 'battle-of-waterloo',
    title: 'Battle of Waterloo',
    notes: 'Napoleon Bonaparte defeated by the Anglo-allied army of the Duke of Wellington and Blücher’s Prussian army. The conflict raged from late morning (11:30 AM) until the French imperial guard broke around 20:30 PM, ending the Napoleonic Wars.',
    color: '#b91c1c',
    category: 'Other',
    startDate: {
      year: 1815,
      month: 6,
      day: 18,
      hour: 11,
      minute: 30,
      precision: 'hour',
      label: 'June 18, 1815, 11:30 AM'
    },
    endDate: {
      year: 1815,
      month: 6,
      day: 18,
      hour: 21,
      minute: 0,
      precision: 'hour',
      label: 'June 18, 1815, 9:00 PM'
    },
    geometry: {
      type: 'point',
      point: [50.6797, 4.4061] // Lion's Mound, Waterloo, Belgium
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Napoleonic Wars', 'Belgium', 'Decisive Battles']
  },

  // 10. Apollo 11 Moon Landing (July 20, 1969, 20:17 UTC) - Hour Resolution
  {
    id: 'apollo-11-landing',
    title: 'Apollo 11 Mission & Lunar Landing',
    notes: 'First crewed mission to land on the Moon. Launched from Cape Canaveral on July 16. Lunar Module Eagle touched down in the Sea of Tranquility on July 20 at 20:17 UTC, and Neil Armstrong stepped onto the lunar surface at 02:56 UTC.',
    color: '#06b6d4',
    category: 'Other',
    startDate: {
      year: 1969,
      month: 7,
      day: 16,
      hour: 13,
      minute: 32,
      precision: 'hour',
      label: 'July 16, 1969, 13:32 UTC (Launch)'
    },
    endDate: {
      year: 1969,
      month: 7,
      day: 24,
      hour: 16,
      minute: 50,
      precision: 'hour',
      label: 'July 24, 1969, 16:50 UTC (Splashdown)'
    },
    geometry: {
      type: 'point',
      point: [28.57287, -80.6490] // Launch Complex 39A, Cape Canaveral, FL
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Space', 'NASA', 'Moon Landing', '20th Century']
  },

  // 11. Fall of the Berlin Wall (November 9, 1989, 19:00) - Hour Resolution
  {
    id: 'fall-of-berlin-wall',
    title: 'Fall of the Berlin Wall',
    notes: 'Following Günter Schabowski’s televised press conference announcing immediate border opening around 19:00, thousands gathered at Bornholmer Straße crossing, causing the dismantling of the Iron Curtain.',
    color: '#10b981',
    category: 'Other',
    startDate: {
      year: 1989,
      month: 11,
      day: 9,
      hour: 19,
      precision: 'hour',
      label: 'Nov 9, 1989, 19:00'
    },
    endDate: {
      year: 1990,
      month: 10,
      day: 3,
      precision: 'day',
      label: 'October 3, 1990 (German Reunification)'
    },
    geometry: {
      type: 'point',
      point: [52.5539, 13.4000] // Bornholmer Straße checkpoint, Berlin
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Cold War', 'Germany', 'Freedom']
  }
];
