const Database = require('better-sqlite3');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'users.db');

console.log('Initializing database at:', dbPath);

// Create database
const db = new Database(dbPath);

// Create users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        voipms_client_id TEXT,
        company TEXT,
        role TEXT DEFAULT 'client',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log('✅ Database initialized successfully!');
console.log('✅ Users table created!');
console.log('\nDatabase location:', dbPath);

db.close();
