/**
 * populate-ai-job.cjs  (FINAL)
 * Ensures at least 25 applicants for "AI Engineer – Agentic Systems".
 * 
 * Strategy:
 * 1. Find the target job
 * 2. Count existing applicants
 * 3. Use existing candidates (those who haven't applied yet) first
 * 4. Create new standalone candidates (no users row needed since candidates.user_id is nullable)
 * 5. For each candidate used, ensure they have a candidate_resumes row
 * 6. Insert job_applications rows
 */

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Realistic dummy data for AI/ML candidates
const FIRST_NAMES = ['Arjun','Priya','Rahul','Sneha','Vikram','Kavya','Aditya','Divya','Rohan','Meera',
                     'Karan','Anjali','Nikhil','Shreya','Siddharth','Pooja','Abhishek','Nisha','Ravi','Nandini',
                     'Varun','Lakshmi','Suresh','Deepa','Amit'];
const LAST_NAMES = ['Kumar','Sharma','Patel','Singh','Reddy','Nair','Gupta','Verma','Mehta','Pillai',
                    'Iyer','Joshi','Rao','Menon','Bose','Malhotra','Pandey','Shah','Saxena','Chatterjee',
                    'Kapoor','Sinha','Mishra','Agarwal','Das'];
const CURRENT_ROLES = ['AI/ML Engineer','Machine Learning Engineer','Data Scientist','AI Researcher',
                       'NLP Engineer','Deep Learning Engineer','AI Engineer','MLOps Engineer',
                       'Research Engineer','Generative AI Developer'];
const SKILLS = [
    ['Python','PyTorch','LangChain','OpenAI API','Agentic Systems','RAG','Vector Databases'],
    ['Python','TensorFlow','HuggingFace','LLMs','Fine-tuning','RLHF','Prompt Engineering'],
    ['Python','LangGraph','AutoGen','LlamaIndex','Pinecone','Weaviate','FastAPI'],
    ['Python','CrewAI','LangChain','GPT-4','Claude','Gemini','Multi-Agent Systems'],
    ['Python','Transformers','BERT','RAG Pipelines','Qdrant','Redis','FastAPI'],
];

async function main() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // ── 1. Find target job ──────────────────────────────────────────────
        console.log('1. Finding target job...');
        const jobRes = await client.query(`
            SELECT job_id, company_id, job_title 
            FROM job_postings 
            WHERE job_title ILIKE '%AI Engineer%Agentic%'
            LIMIT 1
        `);

        if (jobRes.rows.length === 0) {
            // Fallback: list all jobs so we can identify the right one
            const allJobs = await client.query(`SELECT job_id, job_title FROM job_postings ORDER BY job_id LIMIT 20`);
            console.log('Available jobs:', JSON.stringify(allJobs.rows, null, 2));
            throw new Error('Target job not found. Check the job_title above and update the query.');
        }

        const job = jobRes.rows[0];
        console.log(`✅ Found: "${job.job_title}" (job_id=${job.job_id}, company_id=${job.company_id})`);

        // ── 2. Count existing applicants ────────────────────────────────────
        const appsRes = await client.query(
            `SELECT candidate_id FROM job_applications WHERE job_id = $1`, [job.job_id]
        );
        const existingCandidateIds = new Set(appsRes.rows.map(r => r.candidate_id));
        console.log(`2. Existing applicants: ${existingCandidateIds.size}`);

        const TARGET = 25;
        const needed = TARGET - existingCandidateIds.size;
        if (needed <= 0) {
            console.log('✅ Already have 25+ applicants. Nothing to do.');
            await client.query('COMMIT');
            return;
        }
        console.log(`   Need ${needed} more.`);

        // ── 3. Use existing unapplied candidates first ───────────────────────
        const existingIds = [...existingCandidateIds];
        let availableRes;
        if (existingIds.length > 0) {
            availableRes = await client.query(
                `SELECT id, email FROM candidates WHERE id != ALL($1::uuid[]) LIMIT $2`,
                [existingIds, needed]
            );
        } else {
            availableRes = await client.query(
                `SELECT id, email FROM candidates LIMIT $1`, [needed]
            );
        }
        const toProcess = availableRes.rows.map(r => ({ id: r.id, isNew: false }));
        console.log(`3. Existing candidates available: ${toProcess.length}`);

        // ── 4. Create new candidates if still needed ─────────────────────────
        const stillNeeded = needed - toProcess.length;
        console.log(`4. Need to create ${stillNeeded} new dummy candidates...`);
        for (let i = 0; i < stillNeeded; i++) {
            const candidateId = uuidv4();
            const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
            const lastName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
            const fullName = `${firstName} ${lastName}`;
            const email = `ai.candidate.${Date.now()}.${i}@hirex.demo`;
            const currentRole = CURRENT_ROLES[i % CURRENT_ROLES.length];
            const expYears = 1 + (i % 8);
            const skills = SKILLS[i % SKILLS.length];

            await client.query(`
                INSERT INTO candidates (id, name, email, is_fresher, current_role, experience_years, skills)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [candidateId, fullName, email, expYears === 0, currentRole, expYears, skills]);

            toProcess.push({ id: candidateId, isNew: true });
        }
        console.log(`   Created ${stillNeeded} new candidates.`);

        // ── 5. & 6. For each candidate, ensure resume row and add application ─
        const statuses = ['applied', 'under_review', 'shortlisted', 'applied', 'applied'];
        const matchScores = [55, 62, 70, 75, 78, 82, 85, 88, 91, 93, 72, 68, 79, 83, 66,
                             74, 87, 90, 61, 77, 80, 69, 84, 92, 58];
        let appCount = 0;

        for (let i = 0; i < toProcess.length; i++) {
            const cand = toProcess[i];

            // Ensure candidate_resumes row exists
            const resCheck = await client.query(
                `SELECT id FROM candidate_resumes WHERE candidate_id = $1 LIMIT 1`, [cand.id]
            );
            let resumeId;
            if (resCheck.rows.length > 0) {
                resumeId = resCheck.rows[0].id;
            } else {
                resumeId = uuidv4();
                await client.query(`
                    INSERT INTO candidate_resumes (id, candidate_id, resume_name, file_url, file_size_kb, mime_type, is_default)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    resumeId, cand.id,
                    'resume.pdf',
                    'https://example.com/dummy-resume.pdf',
                    120 + (i * 7) % 300,
                    'application/pdf',
                    true
                ]);
            }

            // Insert application
            const appId = uuidv4();
            const status = statuses[i % statuses.length];
            const matchScore = matchScores[i % matchScores.length];
            const shortlistedByAI = matchScore >= 75;
            const daysAgo = Math.floor(Math.random() * 12) + 1;

            await client.query(`
                INSERT INTO job_applications (
                    id, job_id, candidate_id, company_id,
                    resume_id, resume_name, resume_data,
                    status, match_score, shortlisted_by_ai, applied_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                        NOW() - ($11 || ' days')::interval)
            `, [
                appId,
                job.job_id,
                cand.id,
                job.company_id,
                resumeId,
                'resume.pdf',
                'dummy-resume-data', // resume_data is text NOT NULL
                status,
                matchScore,
                shortlistedByAI,
                daysAgo
            ]);

            appCount++;
        }

        await client.query('COMMIT');
        const totalNow = existingCandidateIds.size + appCount;
        console.log(`\n🎉 Done! Inserted ${appCount} new applications.`);
        console.log(`   Total applicants for "${job.job_title}" is now: ${totalNow}`);

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('\n❌ Failed. Rolled back. Error:', e.message);
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
