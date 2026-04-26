require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('./pool');

const users = [
  { phone: '0521000001', email: 'liron@test.com', first_name: 'Liron', last_name: 'Amir', birth_date: '1996-03-12', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Dance instructor. Life is a stage 💃', city: 'Tel Aviv' },
  { phone: '0521000002', email: 'roi@test.com', first_name: 'Roi', last_name: 'Shahar', birth_date: '1993-07-08', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Cybersecurity engineer. Chess nerd ♟️', city: 'Tel Aviv' },
  { phone: '0521000003', email: 'nili@test.com', first_name: 'Nili', last_name: 'Tzur', birth_date: '1999-11-20', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Veterinarian student. Dog mom 🐕', city: 'Rehovot' },
  { phone: '0521000004', email: 'dan@test.com', first_name: 'Dan', last_name: 'Koren', birth_date: '1991-05-17', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Film director. Coffee & cinema ☕🎬', city: 'Tel Aviv' },
  { phone: '0521000005', email: 'shira2@test.com', first_name: 'Shira', last_name: 'Lavi', birth_date: '1998-08-03', gender: 'female', interested_in: 'both', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Yoga & meditation. Plant based 🌱', city: 'Tel Aviv' },
  { phone: '0521000006', email: 'yonatan@test.com', first_name: 'Yonatan', last_name: 'Blum', birth_date: '1994-02-25', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Religious', bio: 'Rabbi student & basketball coach 🏀', city: 'Jerusalem' },
  { phone: '0521000007', email: 'hadar@test.com', first_name: 'Hadar', last_name: 'Peled', birth_date: '2000-09-14', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Industrial design student. Skateboard 🛹', city: 'Haifa' },
  { phone: '0521000008', email: 'eran@test.com', first_name: 'Eran', last_name: 'Doron', birth_date: '1990-12-01', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Hedge fund analyst. Weekend surfer 🏄', city: 'Herzliya' },
  { phone: '0521000009', email: 'maya3@test.com', first_name: 'Maya', last_name: 'Caspi', birth_date: '1997-04-22', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Broadcast journalist. Always curious 🎙️', city: 'Tel Aviv' },
  { phone: '0521000010', email: 'noam2@test.com', first_name: 'Noam', last_name: 'Gal', birth_date: '1995-06-09', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Chef & food blogger. Shabbat cook 🍗', city: 'Bnei Brak' },
  { phone: '0521000011', email: 'tamar@test.com', first_name: 'Tamar', last_name: 'Klein', birth_date: '1996-10-30', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'UX designer. Bookworm 📚', city: 'Tel Aviv' },
  { phone: '0521000012', email: 'ariel2@test.com', first_name: 'Ariel', last_name: 'Nachum', birth_date: '1992-03-18', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Architect. Running marathons 🏃', city: 'Ramat Gan' },
  { phone: '0521000013', email: 'efrat@test.com', first_name: 'Efrat', last_name: 'Sela', birth_date: '1999-07-27', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Occupational therapist. Loves pottery 🏺', city: 'Netanya' },
  { phone: '0521000014', email: 'omer2@test.com', first_name: 'Omer', last_name: 'Ziv', birth_date: '1993-01-15', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'DevOps engineer. Gamer & hiker 🎮', city: 'Tel Aviv' },
  { phone: '0521000015', email: 'gal2@test.com', first_name: 'Gal', last_name: 'Weiss', birth_date: '2001-05-05', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Communications student. Podcast host 🎧', city: 'Tel Aviv' },
  { phone: '0521000016', email: 'kobi@test.com', first_name: 'Kobi', last_name: 'Maman', birth_date: '1988-11-11', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Contractor. Family man. BBQ king 🔥', city: 'Ashdod' },
  { phone: '0521000017', email: 'sarit@test.com', first_name: 'Sarit', last_name: 'Ben-Ami', birth_date: '1998-02-19', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Pilates instructor. Beach lover 🌊', city: 'Herzliya' },
  { phone: '0521000018', email: 'gilad@test.com', first_name: 'Gilad', last_name: 'Perelman', birth_date: '1994-08-14', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Quantum computing researcher 🔬', city: 'Rehovot' },
  { phone: '0521000019', email: 'inbal@test.com', first_name: 'Inbal', last_name: 'Shohat', birth_date: '1997-12-08', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Event planner. Wedding obsessed 💒', city: 'Tel Aviv' },
  { phone: '0521000020', email: 'asaf@test.com', first_name: 'Asaf', last_name: 'Dagan', birth_date: '1990-04-03', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Investment banker. Polo & wine 🍷', city: 'Tel Aviv' },
  { phone: '0521000021', email: 'keren@test.com', first_name: 'Keren', last_name: 'Tzfati', birth_date: '1996-06-23', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Startup marketing. Salsa nights 💃', city: 'Tel Aviv' },
  { phone: '0521000022', email: 'yuval2@test.com', first_name: 'Yuval', last_name: 'Harari', birth_date: '1995-09-01', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'History teacher. Author in progress ✍️', city: 'Jerusalem' },
  { phone: '0521000023', email: 'dafna@test.com', first_name: 'Dafna', last_name: 'Raz', birth_date: '2000-03-29', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Biotech student. Gym & nutrition 💪', city: 'Rehovot' },
  { phone: '0521000024', email: 'moran@test.com', first_name: 'Moran', last_name: 'Ohayon', birth_date: '1993-10-16', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Accountant. Football & family 🏈', city: 'Holon' },
  { phone: '0521000025', email: 'einav@test.com', first_name: 'Einav', last_name: 'Levy', birth_date: '1998-01-07', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Singer-songwriter. Coffee shops & stages 🎵', city: 'Tel Aviv' },
  { phone: '0521000026', email: 'amir2@test.com', first_name: 'Amir', last_name: 'Ashkenazi', birth_date: '1991-07-20', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Product manager at unicorn startup 🦄', city: 'Tel Aviv' },
  { phone: '0521000027', email: 'orly@test.com', first_name: 'Orly', last_name: 'Nissim', birth_date: '1999-05-11', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Social media manager. Coffee & cats ☕🐱', city: 'Petah Tikva' },
  { phone: '0521000028', email: 'nir@test.com', first_name: 'Nir', last_name: 'Ben-David', birth_date: '1994-11-28', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Pilot. World traveler ✈️', city: 'Herzliya' },
  { phone: '0521000029', email: 'dana2@test.com', first_name: 'Dana', last_name: 'Alkalay', birth_date: '1997-08-17', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Graphic novelist. Comic con regular 🎨', city: 'Tel Aviv' },
  { phone: '0521000030', email: 'boaz@test.com', first_name: 'Boaz', last_name: 'Maimon', birth_date: '1989-02-14', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Religious', bio: 'Lawyer. Shomer Shabbat. Looking for partner 💍', city: 'Jerusalem' },
  { phone: '0521000031', email: 'yasmin@test.com', first_name: 'Yasmin', last_name: 'Azulay', birth_date: '2001-10-06', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Just started university. Curious about life 🌍', city: 'Beer Sheva' },
  { phone: '0521000032', email: 'tzahi@test.com', first_name: 'Tzahi', last_name: 'Moshe', birth_date: '1992-06-13', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Police officer. Proud dad of a dog 🐾', city: 'Rishon LeZion' },
  { phone: '0521000033', email: 'roni2@test.com', first_name: 'Roni', last_name: 'Katz', birth_date: '1998-04-24', gender: 'female', interested_in: 'both', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Tattoo artist. Creative soul 🖋️', city: 'Tel Aviv' },
  { phone: '0521000034', email: 'itamar@test.com', first_name: 'Itamar', last_name: 'Segev', birth_date: '1995-12-30', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Navy veteran. Now a marine biologist 🌊', city: 'Haifa' },
  { phone: '0521000035', email: 'linoy@test.com', first_name: 'Linoy', last_name: 'Ashram', birth_date: '2000-05-30', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Rhythmic gymnastics. Gold medal life 🥇', city: 'Rishon LeZion' },
  { phone: '0521000036', email: 'natan@test.com', first_name: 'Natan', last_name: 'Eliyahu', birth_date: '1993-09-19', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'High-tech sales. Love cooking Moroccan food 🥘', city: 'Bat Yam' },
  { phone: '0521000037', email: 'lital@test.com', first_name: 'Lital', last_name: 'Gabay', birth_date: '1996-07-07', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Kindergarten teacher. Love big families ❤️', city: 'Ashdod' },
  { phone: '0521000038', email: 'idan@test.com', first_name: 'Idan', last_name: 'Raichel', birth_date: '1991-03-06', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Musician. Ethiopian-Israeli vibes 🎼', city: 'Tel Aviv' },
  { phone: '0521000039', email: 'reut@test.com', first_name: 'Reut', last_name: 'Zvulun', birth_date: '1999-01-25', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Marine officer. Now studying law ⚓', city: 'Haifa' },
  { phone: '0521000040', email: 'sagi@test.com', first_name: 'Sagi', last_name: 'Ophir', birth_date: '1994-10-10', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'VC partner. Angel investor. Tennis 🎾', city: 'Herzliya' },
  { phone: '0521000041', email: 'fatima@test.com', first_name: 'Fatima', last_name: 'Abu-Rabia', birth_date: '1997-06-15', gender: 'female', interested_in: 'male', religion: 'Muslim', religious_lifestyle: 'Traditional', bio: 'Social worker. Fighting for equality 🤝', city: 'Nazareth' },
  { phone: '0521000042', email: 'khalil@test.com', first_name: 'Khalil', last_name: 'Zoabi', birth_date: '1993-02-28', gender: 'male', interested_in: 'female', religion: 'Muslim', religious_lifestyle: 'Secular', bio: 'Software developer. Arsenal fan ⚽', city: 'Haifa' },
  { phone: '0521000043', email: 'nadia@test.com', first_name: 'Nadia', last_name: 'Haddad', birth_date: '1999-09-09', gender: 'female', interested_in: 'male', religion: 'Christian', religious_lifestyle: 'Traditional', bio: 'Pharmacist. Loves cooking Lebanese food 🧆', city: 'Nazareth' },
  { phone: '0521000044', email: 'samer@test.com', first_name: 'Samer', last_name: 'Bishara', birth_date: '1990-04-18', gender: 'male', interested_in: 'female', religion: 'Christian', religious_lifestyle: 'Secular', bio: 'Entrepreneur. Built 2 startups 🚀', city: 'Tel Aviv' },
  { phone: '0521000045', email: 'mariam@test.com', first_name: 'Mariam', last_name: 'Kassis', birth_date: '1998-11-02', gender: 'female', interested_in: 'male', religion: 'Muslim', religious_lifestyle: 'Traditional', bio: 'Dentist. Hiking & photography 📷', city: 'Umm al-Fahm' },
  { phone: '0521000046', email: 'rania@test.com', first_name: 'Rania', last_name: 'Farhat', birth_date: '1996-08-20', gender: 'female', interested_in: 'male', religion: 'Muslim', religious_lifestyle: 'Secular', bio: 'Fashion designer. Paris dreams 👗', city: 'Tel Aviv' },
  { phone: '0521000047', email: 'fares@test.com', first_name: 'Fares', last_name: 'Issa', birth_date: '1994-05-25', gender: 'male', interested_in: 'female', religion: 'Christian', religious_lifestyle: 'Traditional', bio: 'Civil engineer. Guitar on weekends 🎸', city: 'Haifa' },
  { phone: '0521000048', email: 'violet@test.com', first_name: 'Violet', last_name: 'Khoury', birth_date: '2000-12-12', gender: 'female', interested_in: 'male', religion: 'Christian', religious_lifestyle: 'Secular', bio: 'Art history student. Museum dates 🖼️', city: 'Haifa' },
  { phone: '0521000049', email: 'dawit@test.com', first_name: 'Dawit', last_name: 'Tesfaye', birth_date: '1992-07-04', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Ethiopian-Israeli. IDF vet & nurse 💙', city: 'Netanya' },
  { phone: '0521000050', email: 'miriam2@test.com', first_name: 'Miriam', last_name: 'Abebe', birth_date: '1997-03-21', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Community organizer. Loves injera & hummus 🫓', city: 'Rehovot' },
];

const malePhotos = [
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/men/4.jpg',
  'https://randomuser.me/api/portraits/men/6.jpg',
  'https://randomuser.me/api/portraits/men/7.jpg',
  'https://randomuser.me/api/portraits/men/8.jpg',
  'https://randomuser.me/api/portraits/men/9.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/men/12.jpg',
  'https://randomuser.me/api/portraits/men/13.jpg',
  'https://randomuser.me/api/portraits/men/14.jpg',
  'https://randomuser.me/api/portraits/men/16.jpg',
  'https://randomuser.me/api/portraits/men/17.jpg',
  'https://randomuser.me/api/portraits/men/18.jpg',
  'https://randomuser.me/api/portraits/men/19.jpg',
  'https://randomuser.me/api/portraits/men/21.jpg',
  'https://randomuser.me/api/portraits/men/22.jpg',
  'https://randomuser.me/api/portraits/men/23.jpg',
  'https://randomuser.me/api/portraits/men/24.jpg',
  'https://randomuser.me/api/portraits/men/26.jpg',
];

const femalePhotos = [
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
  'https://randomuser.me/api/portraits/women/7.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
  'https://randomuser.me/api/portraits/women/9.jpg',
  'https://randomuser.me/api/portraits/women/11.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/women/13.jpg',
  'https://randomuser.me/api/portraits/women/14.jpg',
  'https://randomuser.me/api/portraits/women/16.jpg',
  'https://randomuser.me/api/portraits/women/17.jpg',
  'https://randomuser.me/api/portraits/women/18.jpg',
  'https://randomuser.me/api/portraits/women/19.jpg',
  'https://randomuser.me/api/portraits/women/21.jpg',
  'https://randomuser.me/api/portraits/women/22.jpg',
  'https://randomuser.me/api/portraits/women/23.jpg',
  'https://randomuser.me/api/portraits/women/24.jpg',
  'https://randomuser.me/api/portraits/women/26.jpg',
];

async function seed() {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);
    let created = 0;

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
        const photos = u.gender === 'male' ? malePhotos : femalePhotos;
        const photoUrl = photos[i % photos.length];
        await pool.query(
          `INSERT INTO photos (user_id, url, is_primary, order_index) VALUES ($1, $2, true, 0)`,
          [userId, photoUrl]
        );
        created++;
      }
    }

    console.log(`✅ Added ${created} new users (password: password123)`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
