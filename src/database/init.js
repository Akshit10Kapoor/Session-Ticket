const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './season_tickets.db';
const schemaPath = path.join(__dirname, 'init.sql');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = schema.split(';').filter(stmt => stmt.trim());
  
  statements.forEach(statement => {
    if (statement.trim()) {
      db.run(statement + ';', (err) => {
        if (err) {
          console.error('Error executing statement:', err);
        }
      });
    }
  });
  
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database initialized successfully at', dbPath);
    }
  });
});
