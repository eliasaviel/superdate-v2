require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./pool');

const venues = [
  { name: 'Café Landwer Rothschild', description: 'Cozy coffee shop with a relaxed vibe on the famous Rothschild Boulevard.', address: 'Rothschild Blvd 32, Tel Aviv', city: 'Tel Aviv', category: 'Café', price_per_person: 60, image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400' },
  { name: 'Shila Restaurant', description: 'Modern Israeli cuisine with a romantic atmosphere and great wine list.', address: 'Ibn Gabirol 5, Tel Aviv', city: 'Tel Aviv', category: 'Restaurant', price_per_person: 180, image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
  { name: 'Beit HaAmanit Gallery Café', description: 'Art gallery meets café — great for creative conversations.', address: 'Gordon 14, Tel Aviv', city: 'Tel Aviv', category: 'Café', price_per_person: 55, image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400' },
  { name: 'Nanuchka', description: 'Unique Georgian-Israeli fusion in a vibrant colorful space.', address: 'Lilienblum 30, Tel Aviv', city: 'Tel Aviv', category: 'Restaurant', price_per_person: 120, image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
  { name: 'HaAretz Museum Garden', description: 'Stroll through history in this open-air archaeological museum with a charming garden.', address: 'Chaim Levanon 2, Tel Aviv', city: 'Tel Aviv', category: 'Activity', price_per_person: 40, image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' },
  { name: 'Gordon Beach Cocktail Bar', description: 'Beachfront bar with sunset cocktails and sea breeze.', address: 'Gordon Beach, Tel Aviv', city: 'Tel Aviv', category: 'Bar', price_per_person: 80, image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400' },
  { name: 'The Pasta Bar', description: 'Authentic Italian pasta in a warm and intimate setting.', address: 'Ben Yehuda 47, Tel Aviv', city: 'Tel Aviv', category: 'Restaurant', price_per_person: 110, image_url: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=400' },
  { name: 'Dizengoff Square Rooftop', description: 'Trendy rooftop bar with city views and great cocktails.', address: 'Dizengoff Sq, Tel Aviv', city: 'Tel Aviv', category: 'Bar', price_per_person: 90, image_url: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400' },
  { name: 'Sarona Market Wine Bar', description: 'Curated wines and fine cheeses in the beautiful Sarona complex.', address: 'Sarona Market, Tel Aviv', city: 'Tel Aviv', category: 'Bar', price_per_person: 100, image_url: 'https://images.unsplash.com/photo-1470158499416-75be9aa0c4db?w=400' },
  { name: 'Bowling Tel Aviv', description: 'Fun bowling date — perfect for breaking the ice and competing!', address: 'HaBarzel 28, Tel Aviv', city: 'Tel Aviv', category: 'Activity', price_per_person: 70, image_url: 'https://images.unsplash.com/photo-1589643385201-28f5399b0e38?w=400' },
];

async function seed() {
  try {
    let created = 0;
    for (const v of venues) {
      const r = await pool.query(
        `INSERT INTO venues (name, description, address, city, category, price_per_person, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT DO NOTHING RETURNING id`,
        [v.name, v.description, v.address, v.city, v.category, v.price_per_person, v.image_url]
      );
      if (r.rowCount > 0) created++;
    }
    console.log(`✅ Added ${created} venues`);
  } catch (err) {
    console.error('❌ Venue seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
