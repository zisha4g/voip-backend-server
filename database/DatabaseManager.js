const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const db = new Database(dbPath);

class DatabaseManager {
    // Find user by email
    findUserByEmail(email) {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    }

    // Find user by VoIP.ms client ID
    findUserByVoipmsId(voipms_client_id) {
        const stmt = db.prepare('SELECT * FROM users WHERE voipms_client_id = ?');
        return stmt.get(voipms_client_id);
    }

    // Find user by ID
    findUserById(id) {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    }

    // Create new user
    createUser(email, hashedPassword, voipms_client_id, company, role = 'client') {
        const stmt = db.prepare(`
            INSERT INTO users (email, password, voipms_client_id, company, role, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        `);
        
        const result = stmt.run(email, hashedPassword, voipms_client_id, company, role);
        return this.findUserById(result.lastInsertRowid);
    }

    // Update user
    updateUser(id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        
        const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = ?`);
        stmt.run(...values, id);
        
        return this.findUserById(id);
    }

    // Delete user
    deleteUser(id) {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        return stmt.run(id);
    }

    // Get all users
    getAllUsers() {
        const stmt = db.prepare('SELECT id, email, voipms_client_id, company, role, status, created_at FROM users');
        return stmt.all();
    }
}

module.exports = new DatabaseManager();
