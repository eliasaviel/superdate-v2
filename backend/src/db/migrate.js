require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

const migrations = ['001_schema.sql', '002_stage_b.sql'];

async function migrate() {
  try {
    for (const file of migrations) {
      const sql = fs.readFileSync(path.join(__dirname, 'migrations', file), 'utf8');
      await pool.query(sql);
      console.log(`✅ Applied ${file}`);
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
