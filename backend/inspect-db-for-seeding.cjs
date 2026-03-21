/**
 * inspect-db-for-seeding.cjs
 * Inspects the current DB state:
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('\n========== 1. Finding the target job ===========');
        const jobRes = await client.query(`
            SELECT job_id, job_title, company_id, status, experience_level, location
            FROM job_postings
            WHERE job_title ILIKE '%AI Engineer%Agentic%'
            LIMIT 5
        `);
        console.log('Target Job:', JSON.stringify(jobRes.rows, null, 2));

        if (jobRes.rows.length === 0) {
            console.log('\nTrying broader search...');
            const jobRes2 = await client.query(`
                SELECT job_id, job_title, company_id, status FROM job_postings
                WHERE job_title ILIKE '%AI Engineer%' OR job_title ILIKE '%Agentic%'
                LIMIT 10
            `);
            console.log('AI Engineer jobs:', JSON.stringify(jobRes2.rows, null, 2));
        }

        console.log('\n========== 3. Candidates info ===========');
        const candidates = await client.query(`
            SELECT COUNT(*) as count FROM candidates
        `);
        console.log(`Total candidates: ${candidates.rows[0].count}`);

        const someCandidates = await client.query(`
            SELECT c.id as candidate_id, c.user_id, u.email, c.full_name
            FROM candidates c
            JOIN users u ON c.user_id = u.id
            LIMIT 10
        `);
        console.log('Sample candidates:', JSON.stringify(someCandidates.rows, null, 2));

        console.log('\n========== 5. Existing applications for this job ===========');
        const apps = await client.query(`
            SELECT ja.id, ja.job_id, ja.candidate_id, ja.company_id, ja.status, ja.test_status, ja.resume_url
            FROM job_applications ja
            JOIN job_postings jp ON jp.job_id = ja.job_id
            WHERE jp.job_title ILIKE '%AI Engineer%Agentic%'
        `);
        console.log(`Existing applications: ${apps.rows.length}`);
        console.log(JSON.stringify(apps.rows, null, 2));

        console.log('\n========== 9. Check interview tests ===========');
        const tests = await client.query(`
            SELECT t.id, t.job_id, t.title, t.status 
            FROM tests t
            JOIN job_postings jp ON jp.job_id = t.job_id
            WHERE jp.job_title ILIKE '%AI Engineer%Agentic%'
        `);
        console.log('Tests for this job:', JSON.stringify(tests.rows, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
