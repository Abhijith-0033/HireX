// verify-applicants.cjs
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });

pool.query(`
    SELECT ja.status, ja.match_score, ja.shortlisted_by_ai, c.name AS candidate_name, c.email
    FROM job_applications ja
    JOIN candidates c ON c.id = ja.candidate_id
    JOIN job_postings jp ON jp.job_id = ja.job_id
    WHERE jp.job_title ILIKE '%AI Engineer%Agentic%'
    ORDER BY ja.match_score DESC NULLS LAST
`).then(r => {
    console.log('\n✅ Total applicants:', r.rows.length);
    console.table(r.rows);
}).catch(err => {
    console.error('Error:', err.message);
}).finally(() => pool.end());
