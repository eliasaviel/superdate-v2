CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USERS
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           VARCHAR(20)  UNIQUE,
  email           VARCHAR(255) UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100),
  last_name       VARCHAR(100),
  birth_date      DATE,
  gender          VARCHAR(20),
  interested_in   VARCHAR(20)  DEFAULT 'both',
  religion        VARCHAR(50),
  religious_lifestyle VARCHAR(50),
  bio             TEXT,
  city            VARCHAR(100),
  lat             DECIMAL(10,8),
  lng             DECIMAL(11,8),
  min_age_pref    INT          DEFAULT 18,
  max_age_pref    INT          DEFAULT 50,
  is_active       BOOLEAN      DEFAULT TRUE,
  created_at      TIMESTAMP    DEFAULT NOW(),
  updated_at      TIMESTAMP    DEFAULT NOW()
);

-- =====================
-- PHOTOS
-- =====================
CREATE TABLE IF NOT EXISTS photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  is_primary  BOOLEAN DEFAULT FALSE,
  order_index INT     DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- =====================
-- SWIPES
-- =====================
CREATE TABLE IF NOT EXISTS swipes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swiper_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  swiped_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      VARCHAR(10) NOT NULL CHECK (action IN ('LIKE', 'PASS')),
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- =====================
-- MATCHES
-- =====================
CREATE TABLE IF NOT EXISTS matches (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- =====================
-- MESSAGES
-- =====================
CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id     UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_users_city       ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_gender     ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_religion   ON users(religion);
CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date);
CREATE INDEX IF NOT EXISTS idx_photos_user      ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiper    ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped    ON swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1    ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2    ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_match   ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
