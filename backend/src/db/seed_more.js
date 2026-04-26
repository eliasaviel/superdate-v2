require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('./pool');

const users = [
  { phone: '0511000001', email: 'dana@test.com', first_name: 'Dana', last_name: 'Katz', birth_date: '1997-02-14', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Yoga instructor & travel lover ✈️', city: 'Tel Aviv' },
  { phone: '0511000002', email: 'roni@test.com', first_name: 'Roni', last_name: 'Peretz', birth_date: '1994-08-22', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Music producer by night 🎵', city: 'Tel Aviv' },
  { phone: '0511000003', email: 'gali@test.com', first_name: 'Gali', last_name: 'Gross', birth_date: '2000-01-05', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Psychology student. Coffee addict ☕', city: 'Haifa' },
  { phone: '0511000004', email: 'amit@test.com', first_name: 'Amit', last_name: 'Bar', birth_date: '1993-11-30', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Software engineer. Love hiking 🏔️', city: 'Tel Aviv' },
  { phone: '0511000005', email: 'noa@test.com', first_name: 'Noa', last_name: 'Friedman', birth_date: '1999-06-18', gender: 'female', interested_in: 'both', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Artist & dreamer 🎨', city: 'Jerusalem' },
  { phone: '0511000006', email: 'eyal@test.com', first_name: 'Eyal', last_name: 'Cohen', birth_date: '1992-04-12', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Religious', bio: 'Lawyer. Shabbat is sacred 🕍', city: 'Jerusalem' },
  { phone: '0511000007', email: 'shlomit@test.com', first_name: 'Shlomit', last_name: 'Haim', birth_date: '1998-09-25', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Chef who loves family dinners 🍽️', city: 'Beer Sheva' },
  { phone: '0511000008', email: 'guy@test.com', first_name: 'Guy', last_name: 'Levi', birth_date: '1996-03-07', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Startup founder. Surfer 🏄', city: 'Tel Aviv' },
  { phone: '0511000009', email: 'michal@test.com', first_name: 'Michal', last_name: 'Dayan', birth_date: '2001-07-19', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Just finished army. Ready to live! 🌟', city: 'Ramat Gan' },
  { phone: '0511000010', email: 'tal@test.com', first_name: 'Tal', last_name: 'Mizrahi', birth_date: '1995-12-03', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Photographer & storyteller 📷', city: 'Tel Aviv' },
  { phone: '0511000011', email: 'hila@test.com', first_name: 'Hila', last_name: 'Oren', birth_date: '1997-05-28', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Elementary school teacher ❤️', city: 'Netanya' },
  { phone: '0511000012', email: 'yoav@test.com', first_name: 'Yoav', last_name: 'Ben-David', birth_date: '1991-10-14', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Doctor. Looking for real connection 💙', city: 'Tel Aviv' },
  { phone: '0511000013', email: 'anat@test.com', first_name: 'Anat', last_name: 'Shapira', birth_date: '1998-02-08', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Architecture student. Love design 🏛️', city: 'Haifa' },
  { phone: '0511000014', email: 'ido@test.com', first_name: 'Ido', last_name: 'Stern', birth_date: '1994-06-21', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Musician. Piano & guitar 🎹', city: 'Tel Aviv' },
  { phone: '0511000015', email: 'ronit@test.com', first_name: 'Ronit', last_name: 'Avraham', birth_date: '1999-04-16', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Religious', bio: 'Family values. Looking for my bashert 💍', city: 'Jerusalem' },
  { phone: '0511000016', email: 'omar@test.com', first_name: 'Omar', last_name: 'Mansour', birth_date: '1996-08-11', gender: 'male', interested_in: 'female', religion: 'Muslim', religious_lifestyle: 'Traditional', bio: 'Engineer. Football & coffee ⚽', city: 'Haifa' },
  { phone: '0511000017', email: 'reem@test.com', first_name: 'Reem', last_name: 'Khalil', birth_date: '1998-03-29', gender: 'female', interested_in: 'male', religion: 'Muslim', religious_lifestyle: 'Traditional', bio: 'Nurse. Caring and funny 😊', city: 'Nazareth' },
  { phone: '0511000018', email: 'george@test.com', first_name: 'George', last_name: 'Atallah', birth_date: '1993-11-17', gender: 'male', interested_in: 'female', religion: 'Christian', religious_lifestyle: 'Traditional', bio: 'Architect. Love art and history 🏛️', city: 'Haifa' },
  { phone: '0511000019', email: 'mia@test.com', first_name: 'Mia', last_name: 'Khoury', birth_date: '2000-07-04', gender: 'female', interested_in: 'male', religion: 'Christian', religious_lifestyle: 'Secular', bio: 'Med student. Salsa dancer 💃', city: 'Nazareth' },
  { phone: '0511000020', email: 'karim@test.com', first_name: 'Karim', last_name: 'Nasser', birth_date: '1995-01-23', gender: 'male', interested_in: 'female', religion: 'Muslim', religious_lifestyle: 'Secular', bio: 'Lawyer. Real Madrid fan ⚽', city: 'Tel Aviv' },
  { phone: '0511000021', email: 'yael@test.com', first_name: 'Yael', last_name: 'Goldberg', birth_date: '1997-09-10', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Marketing manager. Love brunch 🥑', city: 'Tel Aviv' },
  { phone: '0511000022', email: 'barak@test.com', first_name: 'Barak', last_name: 'Levy', birth_date: '1990-05-15', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'CEO of small startup. Dad jokes included 😄', city: 'Herzliya' },
  { phone: '0511000023', email: 'raz@test.com', first_name: 'Raz', last_name: 'Eliran', birth_date: '2000-12-01', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Social worker. Passionate about people 💛', city: 'Rishon LeZion' },
  { phone: '0511000024', email: 'nadav@test.com', first_name: 'Nadav', last_name: 'Rosen', birth_date: '1993-07-27', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'High school teacher. Basketball 🏀', city: 'Petah Tikva' },
  { phone: '0511000025', email: 'shani@test.com', first_name: 'Shani', last_name: 'Biton', birth_date: '1999-03-14', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Nurse. Love cooking for others 🍲', city: 'Ashdod' },
  { phone: '0511000026', email: 'lior@test.com', first_name: 'Lior', last_name: 'Natan', birth_date: '1996-10-20', gender: 'male', interested_in: 'both', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Graphic designer. Coffee snob ☕', city: 'Tel Aviv' },
  { phone: '0511000027', email: 'maya2@test.com', first_name: 'Maya', last_name: 'Shalit', birth_date: '1994-08-05', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Flight attendant. Always somewhere new ✈️', city: 'Tel Aviv' },
  { phone: '0511000028', email: 'itay@test.com', first_name: 'Itay', last_name: 'Hadad', birth_date: '1992-02-18', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Traditional', bio: 'Physical therapist. Gym & sea 🏊', city: 'Eilat' },
  { phone: '0511000029', email: 'ofri@test.com', first_name: 'Ofri', last_name: 'Paz', birth_date: '2001-06-30', gender: 'female', interested_in: 'male', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'Fashion design student 👗', city: 'Tel Aviv' },
  { phone: '0511000030', email: 'nimrod@test.com', first_name: 'Nimrod', last_name: 'Tal', birth_date: '1995-04-09', gender: 'male', interested_in: 'female', religion: 'Jewish', religious_lifestyle: 'Secular', bio: 'VC analyst. Weekend farmer 🌿', city: 'Kfar Saba' },
];

const malePhotos = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/men/10.jpg',
  'https://randomuser.me/api/portraits/men/15.jpg',
  'https://randomuser.me/api/portraits/men/20.jpg',
  'https://randomuser.me/api/portraits/men/25.jpg',
  'https://randomuser.me/api/portraits/men/30.jpg',
  'https://randomuser.me/api/portraits/men/35.jpg',
  'https://randomuser.me/api/portraits/men/40.jpg',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'https://randomuser.me/api/portraits/men/50.jpg',
  'https://randomuser.me/api/portraits/men/60.jpg',
  'https://randomuser.me/api/portraits/men/70.jpg',
  'https://randomuser.me/api/portraits/men/80.jpg',
  'https://randomuser.me/api/portraits/men/90.jpg',
];

const femalePhotos = [
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/women/5.jpg',
  'https://randomuser.me/api/portraits/women/10.jpg',
  'https://randomuser.me/api/portraits/women/15.jpg',
  'https://randomuser.me/api/portraits/women/20.jpg',
  'https://randomuser.me/api/portraits/women/25.jpg',
  'https://randomuser.me/api/portraits/women/30.jpg',
  'https://randomuser.me/api/portraits/women/35.jpg',
  'https://randomuser.me/api/portraits/women/40.jpg',
  'https://randomuser.me/api/portraits/women/45.jpg',
  'https://randomuser.me/api/portraits/women/50.jpg',
  'https://randomuser.me/api/portraits/women/60.jpg',
  'https://randomuser.me/api/portraits/women/70.jpg',
  'https://randomuser.me/api/portraits/women/80.jpg',
  'https://randomuser.me/api/portraits/women/90.jpg',
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
