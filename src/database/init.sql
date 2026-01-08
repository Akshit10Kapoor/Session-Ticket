-- Season Tickets Database Schema

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  league TEXT NOT NULL,
  city TEXT NOT NULL,
  season INTEGER NOT NULL,
  total_games INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL REFERENCES teams(id),
  name TEXT NOT NULL,
  num_games INTEGER NOT NULL,
  price REAL NOT NULL,
  section TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  package_id INTEGER NOT NULL REFERENCES packages(id),
  status TEXT DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id),
  game_id INTEGER NOT NULL,
  seat_number INTEGER,
  used INTEGER DEFAULT 0,
  used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS renewal_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id),
  renewal_date DATE NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS priority_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL REFERENCES teams(id),
  priority_level INTEGER DEFAULT 5,
  registered_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS access_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  valid_until DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_auto_renew ON subscriptions(auto_renew, end_date);
CREATE INDEX IF NOT EXISTS idx_game_assignments_subscription ON game_assignments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_renewal_history_subscription ON renewal_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_user ON access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_valid ON access_tokens(valid_until);
