CREATE TABLE IF NOT EXISTS ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  submitter TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
