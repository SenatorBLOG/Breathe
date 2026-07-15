// scripts/seedGlobePins.js
//
// Seeds the Meditation Globe with realistic community pins so the map never
// greets a first-time visitor empty. Coordinates point at public landmarks
// (parks, beaches, viewpoints) — never residences. Pins are anonymous
// (no userId), so the API's privacy shaping applies to every viewer.
//
// Usage:  node scripts/seedGlobePins.js          (only seeds when < 10 pins)
//         node scripts/seedGlobePins.js --force  (seeds regardless)
require('dotenv').config();
const mongoose = require('mongoose');
const GlobePin = require('../models/GlobePin');

const SPOTS = [
  // ── Americas ──────────────────────────────────────────────────────────────
  { lat: 49.3017, lng: -123.1417, city: 'Vancouver',    country: 'Canada',       technique: 'box',       username: 'Maya',    note: 'Sunrise at Stanley Park seawall. Cold air, calm mind.' },
  { lat: 51.1784, lng: -115.5708, city: 'Banff',        country: 'Canada',       technique: 'coherent',  username: 'Liam',    note: 'Mountain air makes every breath feel earned.' },
  { lat: 45.5122, lng: -73.5540,  city: 'Montreal',     country: 'Canada',       technique: '4-7-8',     username: 'Chloé',   note: 'Parc du Mont-Royal, feuilles qui tombent.' },
  { lat: 40.7812, lng: -73.9665,  city: 'New York',     country: 'USA',          technique: '4-7-8',     username: 'Jordan',  note: 'Central Park before the city wakes up.' },
  { lat: 37.7694, lng: -122.4862, city: 'San Francisco',country: 'USA',          technique: 'box',       username: 'Priya',   note: 'Golden Gate Park, fog rolling in. Perfect stillness.' },
  { lat: 21.2734, lng: -157.8224, city: 'Honolulu',     country: 'USA',          technique: 'belly',     username: 'Kai',     note: 'Waikiki at dawn. Waves set the rhythm.' },
  { lat: 19.4204, lng: -99.1826,  city: 'Mexico City',  country: 'Mexico',       technique: 'belly',     username: 'Sofía',   note: 'Bosque de Chapultepec entre los árboles.' },
  { lat: 20.2114, lng: -87.4654,  city: 'Tulum',        country: 'Mexico',       technique: 'wim-hof',   username: 'Diego',   note: 'Beach session after cenote swim. Electric.' },
  { lat: -22.9519, lng: -43.2105, city: 'Rio de Janeiro', country: 'Brazil',     technique: 'wim-hof',   username: 'João',    note: 'Ipanema at sunset, breathing with the ocean.' },
  { lat: -34.5711, lng: -58.4233, city: 'Buenos Aires', country: 'Argentina',    technique: 'alternate', username: 'Valentina', note: 'Bosques de Palermo, mate y respiración.' },
  { lat: -13.5170, lng: -71.9785, city: 'Cusco',        country: 'Peru',         technique: 'coherent',  username: 'Amaru',   note: 'Altitude teaches you to respect every breath.' },
  { lat: -33.4372, lng: -70.6506, city: 'Santiago',     country: 'Chile',        technique: 'box',       username: 'Camila',  note: 'Cerro San Cristóbal, smog below, clarity above.' },
  { lat: 4.6584,  lng: -74.0548,  city: 'Bogotá',       country: 'Colombia',     technique: 'belly',     username: 'Mateo',   note: 'Parque Simón Bolívar on a quiet Sunday.' },
  { lat: 43.6677, lng: -79.3948,  city: 'Toronto',      country: 'Canada',       technique: 'other',     username: 'Aisha',   note: 'High Park cherry blossoms. Five minutes of nothing.' },

  // ── Europe ────────────────────────────────────────────────────────────────
  { lat: 51.5313, lng: -0.1570,  city: 'London',        country: 'United Kingdom', technique: 'box',     username: 'Oliver',  note: "Regent's Park bench, tea gone cold, mind gone quiet." },
  { lat: 48.8635, lng: 2.3376,   city: 'Paris',         country: 'France',       technique: '4-7-8',     username: 'Élodie',  note: 'Jardin des Tuileries, matin gris, souffle long.' },
  { lat: 52.5163, lng: 13.3777,  city: 'Berlin',        country: 'Germany',      technique: 'wim-hof',   username: 'Jonas',   note: 'Tiergarten in winter. The cold is the teacher.' },
  { lat: 52.3579, lng: 4.8686,   city: 'Amsterdam',     country: 'Netherlands',  technique: 'coherent',  username: 'Femke',   note: 'Vondelpark by the pond. Bikes hum past, I breathe.' },
  { lat: 41.3851, lng: 2.1734,   city: 'Barcelona',     country: 'Spain',        technique: 'belly',     username: 'Marc',    note: 'Rooftop near Sagrada Família, swifts overhead.' },
  { lat: 38.7223, lng: -9.1393,  city: 'Lisbon',        country: 'Portugal',     technique: 'alternate', username: 'Inês',    note: 'Miradouro da Senhora do Monte at golden hour.' },
  { lat: 41.8919, lng: 12.4922,  city: 'Rome',          country: 'Italy',        technique: 'box',       username: 'Giulia',  note: 'Villa Borghese pines. Ancient city, ancient practice.' },
  { lat: 37.9715, lng: 23.7267,  city: 'Athens',        country: 'Greece',       technique: 'belly',     username: 'Nikos',   note: 'Philopappos Hill facing the Acropolis.' },
  { lat: 47.3769, lng: 8.5417,   city: 'Zurich',        country: 'Switzerland',  technique: 'coherent',  username: 'Lena',    note: 'Lake Zurich morning mist. Swans as witnesses.' },
  { lat: 64.1466, lng: -21.9426, city: 'Reykjavik',     country: 'Iceland',      technique: 'wim-hof',   username: 'Björn',   note: 'After the cold plunge. Alive is an understatement.' },
  { lat: 59.9311, lng: 30.3609,  city: 'St. Petersburg', country: 'Russia',      technique: '4-7-8',     username: 'Anna',    note: 'Летний сад, белые ночи, длинный выдох.' },
  { lat: 55.7297, lng: 37.6013,  city: 'Moscow',        country: 'Russia',       technique: 'box',       username: 'Mikhail', note: 'Парк Горького у реки. Дыхание ровнее — мысли тише.' },
  { lat: 50.0755, lng: 14.4378,  city: 'Prague',        country: 'Czechia',      technique: 'alternate', username: 'Tereza',  note: 'Petřín Hill above the red roofs.' },
  { lat: 59.3293, lng: 18.0686,  city: 'Stockholm',     country: 'Sweden',       technique: 'coherent',  username: 'Erik',    note: 'Djurgården in October. Fika after, of course.' },
  { lat: 41.0082, lng: 28.9784,  city: 'Istanbul',      country: 'Turkey',       technique: 'belly',     username: 'Zeynep',  note: 'Ferry across the Bosphorus, gulls keeping time.' },
  { lat: 41.7151, lng: 44.8271,  city: 'Tbilisi',       country: 'Georgia',      technique: 'other',     username: 'Giorgi',  note: 'Mtatsminda at dusk, city lights breathing below.' },

  // ── Africa & Middle East ─────────────────────────────────────────────────
  { lat: 31.6295, lng: -7.9811,  city: 'Marrakech',     country: 'Morocco',      technique: 'belly',     username: 'Yasmine', note: 'Jardin Majorelle blue walls, quiet corner.' },
  { lat: -33.9628, lng: 18.4098, city: 'Cape Town',     country: 'South Africa', technique: 'box',       username: 'Thandi',  note: 'Table Mountain trailhead before the crowds.' },
  { lat: -1.2833, lng: 36.8167,  city: 'Nairobi',       country: 'Kenya',        technique: 'coherent',  username: 'Wanjiru', note: 'Karura Forest — birdsong instead of traffic.' },
  { lat: 25.2285, lng: 55.2593,  city: 'Dubai',         country: 'UAE',          technique: '4-7-8',     username: 'Omar',    note: 'Desert dawn outside the city. Absolute silence.' },
  { lat: 32.0809, lng: 34.7806,  city: 'Tel Aviv',      country: 'Israel',       technique: 'wim-hof',   username: 'Noa',     note: 'Beach run then breath work. Mediterranean reset.' },

  // ── Asia ──────────────────────────────────────────────────────────────────
  { lat: 19.0596, lng: 72.8295,  city: 'Mumbai',        country: 'India',        technique: 'alternate', username: 'Arjun',   note: 'Marine Drive at 6am — the city inhales with you.' },
  { lat: 30.0869, lng: 78.2676,  city: 'Rishikesh',     country: 'India',        technique: 'alternate', username: 'Kavya',   note: 'Ganga aarti, pranayama where it was born.' },
  { lat: 15.2993, lng: 74.1240,  city: 'Goa',           country: 'India',        technique: 'belly',     username: 'Rohan',   note: 'Palolem beach, low tide, slow breath.' },
  { lat: 27.7172, lng: 85.3240,  city: 'Kathmandu',     country: 'Nepal',        technique: 'coherent',  username: 'Pemba',   note: 'Boudhanath kora at dawn. Prayer wheels and breath.' },
  { lat: 13.7563, lng: 100.5018, city: 'Bangkok',       country: 'Thailand',     technique: 'belly',     username: 'Nok',     note: 'Lumphini Park tai chi hour. Monitor lizards approve.' },
  { lat: -8.5069, lng: 115.2625, city: 'Ubud',          country: 'Indonesia',    technique: 'alternate', username: 'Wayan',   note: 'Rice terraces at first light. Everything green breathes.' },
  { lat: 1.2816,  lng: 103.8636, city: 'Singapore',     country: 'Singapore',    technique: 'box',       username: 'Wei',     note: 'Gardens by the Bay before opening. City in a forest.' },
  { lat: 21.0285, lng: 105.8542, city: 'Hanoi',         country: 'Vietnam',      technique: 'coherent',  username: 'Linh',    note: 'Hoan Kiem lake loop with the morning exercisers.' },
  { lat: 22.2793, lng: 114.1628, city: 'Hong Kong',     country: 'China',        technique: 'box',       username: 'Ka-Yan',  note: 'Victoria Peak trail, skyscrapers below the clouds.' },
  { lat: 35.0116, lng: 135.7681, city: 'Kyoto',         country: 'Japan',        technique: '4-7-8',     username: 'Haruki',  note: 'Kamo river bank. Herons fish, I sit.' },
  { lat: 35.6852, lng: 139.7528, city: 'Tokyo',         country: 'Japan',        technique: 'box',       username: 'Yui',     note: 'Imperial Palace gardens at lunch. Reset button.' },
  { lat: 37.5512, lng: 126.9882, city: 'Seoul',         country: 'South Korea',  technique: '4-7-8',     username: 'Minjun',  note: 'Namsan tower path, cherry blossoms falling.' },
  { lat: 43.2567, lng: 76.9286,  city: 'Almaty',        country: 'Kazakhstan',   technique: 'wim-hof',   username: 'Aruzhan', note: 'Кок-Тобе утром, горы держат тишину.' },

  // ── Oceania ───────────────────────────────────────────────────────────────
  { lat: -33.8568, lng: 151.2153, city: 'Sydney',       country: 'Australia',    technique: 'belly',     username: 'Ruby',    note: 'Botanic Garden, harbour glitter, cockatoos yelling.' },
  { lat: -37.8304, lng: 144.9796, city: 'Melbourne',    country: 'Australia',    technique: 'coherent',  username: 'Noah',    note: 'Royal Botanic lake. Four seasons in one session.' },
  { lat: -45.0312, lng: 168.6626, city: 'Queenstown',   country: 'New Zealand',  technique: 'wim-hof',   username: 'Aroha',   note: 'Lake Wakatipu, glacial water on the face first.' },
];

// Spread creation dates over the past 60 days so the feed looks organic.
function randomRecentDate() {
  const daysAgo = Math.random() * 60;
  return new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
}

async function main() {
  const force = process.argv.includes('--force');
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await GlobePin.countDocuments();
  if (existing >= 10 && !force) {
    console.log(`Already ${existing} pins — skipping (use --force to seed anyway).`);
    return mongoose.disconnect();
  }

  const docs = SPOTS.map(s => ({
    ...s,
    title:       'Meditation spot',
    sessionLink: '',
    photoUrl:    '',
    likeCount:   Math.floor(Math.random() * 14),
    createdAt:   randomRecentDate(),
  }));

  const res = await GlobePin.insertMany(docs);
  console.log(`Seeded ${res.length} pins (total now ${existing + res.length}).`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
