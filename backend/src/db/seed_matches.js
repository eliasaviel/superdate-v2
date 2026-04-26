require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./pool');

async function seed() {
  try {
    // Get all users with their gender/interested_in
    const { rows: users } = await pool.query(
      `SELECT id, first_name, gender, interested_in FROM users ORDER BY created_at`
    );

    const males = users.filter(u => u.gender === 'male');
    const females = users.filter(u => u.gender === 'female');

    // Build compatible pairs: male interested_in female/both ↔ female interested_in male/both
    const pairs = [];
    for (const m of males) {
      if (!['female', 'both'].includes(m.interested_in)) continue;
      for (const f of females) {
        if (!['male', 'both'].includes(f.interested_in)) continue;
        pairs.push([m, f]);
      }
    }

    // Shuffle pairs
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    // Pick ~40 pairs and assign different stages
    const selected = pairs.slice(0, 40);
    const stages = [
      { stage: 'matched',    chat_unlocked: false, count: 15 },
      { stage: 'vibe_check', chat_unlocked: false, count: 10 },
      { stage: 'superdate',  chat_unlocked: false, count: 8  },
      { stage: 'dating',     chat_unlocked: true,  count: 7  },
    ];

    let idx = 0;
    let matchCount = 0;
    let swipeCount = 0;

    for (const { stage, chat_unlocked, count } of stages) {
      for (let i = 0; i < count && idx < selected.length; i++, idx++) {
        const [u1, u2] = selected[idx];

        // Insert mutual swipes
        await pool.query(
          `INSERT INTO swipes (swiper_id, swiped_id, action)
           VALUES ($1,$2,'LIKE'),($2,$1,'LIKE') ON CONFLICT (swiper_id, swiped_id) DO NOTHING`,
          [u1.id, u2.id]
        );
        swipeCount += 2;

        // Insert match with stage
        const res = await pool.query(
          `INSERT INTO matches (user1_id, user2_id, stage, chat_unlocked)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT DO NOTHING RETURNING id`,
          [u1.id, u2.id, stage, chat_unlocked]
        );
        if (res.rowCount === 0) continue;
        matchCount++;
        const matchId = res.rows[0].id;

        // For vibe_check stage: create a vibe_check row
        if (stage === 'vibe_check' || stage === 'superdate' || stage === 'dating') {
          const roomName = `superdate-${matchId.slice(0, 8)}`;
          const vcStatus = (stage === 'superdate' || stage === 'dating') ? 'confirmed' : 'scheduled';
          await pool.query(
            `INSERT INTO vibe_checks (match_id, daily_room_name, daily_room_url, status, user1_confirmed, user2_confirmed)
             VALUES ($1,$2,$3,$4,$5,$6)
             ON CONFLICT DO NOTHING`,
            [matchId, roomName, `https://superdate.daily.co/${roomName}`, vcStatus,
             vcStatus === 'confirmed', vcStatus === 'confirmed']
          );
        }

        // For superdate/dating stage: create a proposal
        if (stage === 'superdate' || stage === 'dating') {
          const { rows: venues } = await pool.query(`SELECT id FROM venues LIMIT 10`);
          const venue = venues[Math.floor(Math.random() * venues.length)];
          const bothPaid = stage === 'dating';
          const propStatus = bothPaid ? 'confirmed' : 'pending';
          await pool.query(
            `INSERT INTO superdate_proposals (match_id, venue_id, proposer_id, proposer_paid, receiver_paid, status)
             VALUES ($1,$2,$3,$4,$5,$6)
             ON CONFLICT DO NOTHING`,
            [matchId, venue.id, u1.id, bothPaid, bothPaid, propStatus]
          );
        }

        // For dating stage: seed a few chat messages
        if (stage === 'dating') {
          const msgs = [
            { sender: u1.id, text: `Hey ${u2.first_name}! So excited we're finally chatting 😊` },
            { sender: u2.id, text: `Me too! Can't wait for our date 🍷` },
            { sender: u1.id, text: `Same! See you there ✨` },
          ];
          for (const msg of msgs) {
            await pool.query(
              `INSERT INTO messages (match_id, sender_id, message_text) VALUES ($1,$2,$3)`,
              [matchId, msg.sender, msg.text]
            );
          }
        }
      }
    }

    console.log(`✅ Created ${matchCount} matches (${swipeCount} swipes)`);
    console.log(`   • 15 at "matched" stage`);
    console.log(`   • 10 at "vibe_check" stage`);
    console.log(`   • 8  at "superdate" stage`);
    console.log(`   • 7  at "dating" stage (chat unlocked + messages)`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

seed();
