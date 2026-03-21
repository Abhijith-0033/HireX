import 'dotenv/config';
import pool from './config/db.js';

async function testLoginQuery() {
    try {
        console.log('Testing database connection...');
        const res = await pool.query('SELECT 1');
        console.log('DB Connection OK:', res.rows);

        const email = 'test@example.com'; // Change this to a real email if known
        console.log(`Searching for user: ${email}`);

        const checkUserQuery = `
            SELECT id, email, password_hash, role, is_verified, name, created_at
            FROM credentials
            WHERE email = $1
        `;

        const { rows } = await pool.query(checkUserQuery, [email]);
        console.log('Query result:', rows);

        if (rows.length === 0) {
            console.log('User not found in DB.');
        } else {
            console.log('User found! Columns match.');
        }

    } catch (err) {
        console.error('DATABASE ERROR:', err);
    } finally {
        await pool.end();
    }
}

testLoginQuery();
