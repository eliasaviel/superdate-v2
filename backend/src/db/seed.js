require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('./pool');

const users = [
  {
    phone: '0501111111', email: 'maya@test.com', first_name: 'Maya', last_name: 'Cohen',
    birth_date: '1998-03-15', gender: 'female', interested_in: 'male',
    religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Love hiking and coffee ☕', city: 'Tel Aviv',
  },
  {
    phone: '0502222222', email: 'noam@test.com', first_name: 'Noam', last_name: 'Levi',
    birth_date: '1995-07-22', gender: 'male', interested_in: 'female',
    religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Chef by passion, coder by day 🍳', city: 'Tel Aviv',
  },
  {
    phone: '0503333333', email: 'shira@test.com', first_name: 'Shira', last_name: 'Mizrahi',
    birth_date: '1999-11-08', gender: 'female', interested_in: 'both',
    religion: 'Jewish', religious_lifestyle: 'Religious', bio: 'Books, art, and good conversations 📚', city: 'Jerusalem',
  },
  {
    phone: '0504444444', email: 'oren@test.com', first_name: 'Oren', last_name: 'Ben-David',
    birth_date: '1993-05-30', gender: 'male', interested_in: 'female',
    religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Startup founder. Surf on weekends 🏄', city: 'Haifa',
  },
  {
    phone: '0505555555', email: 'nadia@test.com', first_name: 'Nadia', last_name: 'Khoury',
    birth_date: '1997-09-12', gender: 'female', interested_in: 'male',
    religion: 'Christian', religious_lifestyle: 'Traditional', bio: 'Dancer and yoga teacher 🧘', city: 'Nazareth',
  },
  {
    phone: '0506666666', email: 'yousef@test.com', first_name: 'Yousef', last_name: 'Hassan',
    birth_date: '1994-01-25', gender: 'male', interested_in: 'female',
    religion: 'Muslim', religious_lifestyle: 'Traditional', bio: 'Engineer. Love football and cooking 🏈', city: 'Tel Aviv',
  },
  {
    phone: '0507777777', email: 'liora@test.com', first_name: 'Liora', last_name: 'Shapiro',
    birth_date: '2000-06-18', gender: 'female', interested_in: 'male',
    religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Med student ☂️. Fun > everything', city: 'Beer Sheva',
  },
  {
    phone: '0508888888', email: 'tamar@test.com', first_name: 'Tamar', last_name: 'Azulay',
    birth_date: '1996-04-03', gender: 'female', interested_in: 'male',
    religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Lawyer who paints on weekends 🎨', city: 'Tel Aviv',
  },
];

const photoPlaceholders = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/men/41.jpg',
  'https://randomuser.me/api/portraits/women/28.jpg',
  'https://randomuser.me/api/portraits/men/55.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/women/73.jpg',
];

async function seed() {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const result = await pool.query(
        `INSERT INTO users (phone, email, password_hash, first_name, last_name, birth_date, gender,
          interested_in, religion, religious_lifestyle, bio, city)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [u.phone, u.email, passwordHash, u.first_name, u.last_name, u.birth_date,
          u.gender, u.interested_in, u.religion, u.religious_lifestyle, u.bio, u.city]
      );

      if (result.rowCount > 0) {
        const userId = result.rows[0].id;
        await pool.query(
          `INSERT INTO photos (user_id, url, is_primary, order_index) VALUES ($1, $2, true, 0)`,
          [userId, photoPlaceholders[i]]
        );
      }
    }

    console.log('✅ Seed completed — 8 test users created');
    console.log('   Login with any email above, password: password123');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
