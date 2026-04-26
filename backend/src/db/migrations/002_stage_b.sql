-- Stage B: Vibe Check + SuperDate flow

ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage VARCHAR(20) DEFAULT 'matched';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS chat_unlocked BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS vibe_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  daily_room_name VARCHAR(255),
  daily_room_url VARCHAR(500),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  user1_confirmed BOOLEAN DEFAULT FALSE,
  user2_confirmed BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500),
  city VARCHAR(100) DEFAULT 'Tel Aviv',
  category VARCHAR(100),
  price_per_person INTEGER NOT NULL,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS superdate_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id),
  proposer_id UUID NOT NULL REFERENCES users(id),
  proposed_date TIMESTAMPTZ,
  proposer_paid BOOLEAN DEFAULT FALSE,
  receiver_paid BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vibe_checks_match ON vibe_checks(match_id);
CREATE INDEX IF NOT EXISTS idx_superdate_proposals_match ON superdate_proposals(match_id);
