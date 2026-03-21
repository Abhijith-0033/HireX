import pool from './config/db.js';

const tables = ['user_themes', 'credentials'];

for (const t of tables) {
    try {
        const r = await pool.query(
            `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}' ORDER BY ordinal_position`
        );
        console.log(`\n=== ${t} ===`);
        r.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
    } catch (e) {
        console.error(`Error reading ${t}:`, e.message);
    }
}
process.exit(0);
