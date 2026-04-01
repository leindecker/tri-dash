// Simple SQLite helper for persisting users and Strava tokens
// Uses better-sqlite3 for synchronous convenience inside Node.js server runtime
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, 'database.sqlite');

const db = new Database(DB_PATH);

// Create tables if they don't exist
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strava_athlete_id INTEGER UNIQUE,
  firstname TEXT,
  lastname TEXT,
  profile TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  updated_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS strava_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at INTEGER,
  scope TEXT,
  token_type TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  updated_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

// Ensure there's a UNIQUE constraint/index on user_id so we can use
// ON CONFLICT(user_id) DO UPDATE in upsertTokens. If the table already
// existed without the unique constraint, this will create a unique index
// (and will fail if duplicate user_id rows already exist).
db.exec(`
CREATE UNIQUE INDEX IF NOT EXISTS idx_strava_tokens_user_id ON strava_tokens(user_id);
`);

const getUserByStravaId = db.prepare(
  'SELECT * FROM users WHERE strava_athlete_id = ?'
);

const createUser = db.prepare(
  `INSERT INTO users (strava_athlete_id, firstname, lastname, profile) VALUES (?, ?, ?, ?)`
);

const updateUser = db.prepare(
  `UPDATE users SET firstname = ?, lastname = ?, profile = ?, updated_at = strftime('%s','now') WHERE id = ?`
);

const getUserByIdStmt = db.prepare('SELECT * FROM users WHERE id = ?');

// We'll perform an explicit upsert in JS to avoid depending on SQLite UPSERT
const selectTokensByUserId = db.prepare('SELECT * FROM strava_tokens WHERE user_id = ?');
const insertTokens = db.prepare(
  `INSERT INTO strava_tokens (user_id, access_token, refresh_token, expires_at, scope, token_type)
   VALUES (?, ?, ?, ?, ?, ?)`
);
const updateTokens = db.prepare(
  `UPDATE strava_tokens SET access_token = ?, refresh_token = ?, expires_at = ?, scope = ?, token_type = ?, updated_at = strftime('%s','now') WHERE user_id = ?`
);

const upsertTokensTx = db.transaction((userId, tokens) => {
  const existing = selectTokensByUserId.get(userId);
  if (existing) {
    updateTokens.run(tokens.access_token, tokens.refresh_token, tokens.expires_at, tokens.scope || null, tokens.token_type || null, userId);
    return selectTokensByUserId.get(userId);
  } else {
    insertTokens.run(userId, tokens.access_token, tokens.refresh_token, tokens.expires_at, tokens.scope || null, tokens.token_type || null);
    return selectTokensByUserId.get(userId);
  }
});

export function getOrCreateUserFromAthlete(athlete) {
  const existing = getUserByStravaId.get(athlete.id);
  if (existing) {
    // update basic profile fields
    updateUser.run(athlete.firstname, athlete.lastname, athlete.profile, existing.id);
    return existing;
  }

  const info = createUser.run(athlete.id, athlete.firstname, athlete.lastname, athlete.profile);
  return getUserById(info.lastInsertRowid);
}

export function upsertStravaTokens(userId, tokens) {
  return upsertTokensTx(userId, tokens);
}

export function getStravaTokensForUser(userId) {
  // Directly return the row from the prepared statement
  return selectTokensByUserId.get(userId);
}

export function getUserById(id) {
  return getUserByIdStmt.get(id);
}

export default db;


