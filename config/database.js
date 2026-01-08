const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './season_tickets.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error', err);
  } else {
    console.log('Connected to SQLite database');
    db.run('PRAGMA foreign_keys = ON');
  }
});

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const sqlUpper = sql.trim().toUpperCase();
    if (sqlUpper.startsWith('SELECT') || sqlUpper.includes('RETURNING')) {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows });
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ rows: [{ id: this.lastID, changes: this.changes }] });
      });
    }
  });
};

const getConnection = () => Promise.resolve(db);

module.exports = {
  query,
  getConnection,
  db,
};
