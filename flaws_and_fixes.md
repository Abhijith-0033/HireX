# Platform Security & Implementation Review: Flaws, Gaps, and Fixes

## 1. Authentication Module (`/backend/routes/auth.js`)

### Flaws & Vulnerabilities
1. **Token Leakage in OAuth Callback (Critical):**
   - **Flaw:** The Google OAuth callback (`/api/auth/google/callback`) redirects to the frontend passing the raw JWT token in the URL query string (`/oauth-success?token=${token}`). This exposes the token to browser history, proxy logs, and `Referer` headers.
   - **Fix:** Do not pass sensitive JWTs in URL parameters. Instead, set the token in an `HttpOnly`, `Secure` cookie during the redirect, or use a secure one-time code exchange mechanism.

2. **Prolonged JWT Lifespan without Revocation (High):**
   - **Flaw:** JWTs are issued with a 7-day expiration. There is no `/logout` endpoint to invalidate or blacklist these tokens on the server side.
   - **Fix:** Implement short-lived access tokens (15-30 minutes) and secure, `HttpOnly` refresh tokens (7 days). Add a `POST /api/auth/logout` endpoint that blacklists the refresh token (e.g., in Redis).

3. **User Enumeration Vulnerability (Medium):**
   - **Fix:** Use a generic message during registration such as `"Registration process complete."`

4. **Missing Explicit Route-Level Rate Limiting (Medium):**
   - **Fix:** Apply a strict rate limiter (e.g., max 5 attempts per 15 minutes) on authentication routes.

## 2. Jobs Module (`/backend/routes/jobs.js`)

### Flaws & Vulnerabilities
1. **Public Information Disclosure of "Expected Answers" (Critical):**
   - **Flaw:** In `GET /api/jobs/:id` (a public route for job seekers to view a job), the query `SELECT * FROM job_questions` fetches all columns, including `expected_answer`. Job seekers can simply inspect the API response and see the exact answers the recruiter expects them to give for screening questions.
   - **Fix:** Exclude the `expected_answer` column from the public SELECT query. Only fetch it in private/recruiter-specific routes.

2. **Unpaginated Database Queries (High):**
   - **Flaw:** Both `GET /api/jobs` and `GET /api/jobs/recruiter` execute an unlimited `SELECT * FROM job_postings`.
   - **Fix:** Implement query pagination (`LIMIT` and `OFFSET`).

3. **Lack of Strict Input Validation & Array Size Limits (Medium/High):**
   - **Fix:** Implement a robust validation schema (Zod/Joi) enforcing length bounds.

## 3. Applications Module (`/backend/routes/applications.js`)

### Flaws & Vulnerabilities
1. **Event Loop Blocking via Synchronous File I/O (Critical):**
   - **Flaw:** In `GET /applications/my-applications`, `fs.appendFileSync('debug-apps.log', ...)` is used inside an asynchronous API route. This blocks the entire event loop, completely halting the server for all concurrent users during disk I/O operations.
   - **Fix:** Use asynchronous logging libraries like `winston` or `pino`, or at least use the async `fs.promises.appendFile`.

2. **Unbounded Array Iteration in Database Transactions (High - DB DoS):**
   - **Fix:** Limit the maximum array size during validation (e.g., max 100 skills). Refactor SQL queries to perform bulk inserts.

## 4. AI & Interview Modules (`aiToolsRoutes.js`, `interviewRoutes.js`)

### Flaws & Vulnerabilities
1. **Unbounded AI Processing Loop (High):**
   - **Flaw:** `POST /shortlist/:jobId` executes `rankCandidates` on all applications sequentially and then maps over all results to sequentially update the DB. This will block Node and timeout the HTTP request for large applicant pools.
   - **Fix:** Offload processing to a background job queue (e.g., BullMQ) and process in batches. Provide a polling endpoint or WebSocket for progress updates.

2. **Insecure Agora Token Generation Design (Medium):**
   - **Flaw:** `POST /api/interviews/join` accepts arbitrary channel names from the client, enabling enumeration brute-forcing.
   - **Fix:** Fetch the `channelName` directly from the database using an `interviewId`.

3. **Email Trigger Abuse Vector (Medium):**
   - **Fix:** Bind the route to a strict rate limiter (e.g., max 3 emails per day per interview ID).

## 5. Company & Candidates Modules (`companies.js`, `candidates.js`)

### Flaws & Vulnerabilities
1. **Uncapped Multer Memory Storage (High - OOM Risk):**
   - **Flaw:** Both modules use `multer.memoryStorage()` with a 5MB limit. If 100 users upload 5MB resumes concurrently, Node immediately allocates 500MB, greatly increasing the risk of Out of Memory (OOM) crashes.
   - **Fix:** Use `multer.diskStorage()` to save temporary files to disk, process them, and clean up, or stream them directly to cloud storage.

2. **Stored XSS Vulnerability in Profile Text Fields (Medium):**
   - **Flaw:** Rich text inputs are persisted without sanitization. If the React frontend ever uses `dangerouslySetInnerHTML`, XSS vulnerabilities will manifest.
   - **Fix:** Sanitize inputs aggressively on the backend using an HTML sanitizer (like `xss`) before database insertion.

## 6. Frontend Authentication & Routing (`AuthContext.jsx`, `AppRoutes.jsx`)

### Flaws & Vulnerabilities
1. **Insecure Storage of JWT (High):**
   - **Flaw:** The platform stores its authentication JWT directly in `localStorage` (`localStorage.setItem('token', data.token)`). If the platform suffers from a single XSS vulnerability (e.g., from the unsanitized profile descriptions above), an attacker can easily execute `localStorage.getItem('token')` and permanently steal the user's session.
   - **Fix:** Migrate JWT storage to an `HttpOnly`, `Secure`, `SameSite=Strict` cookie managed entirely by the backend, meaning JavaScript cannot read the token payload under any circumstance.

2. **Login CSRF / Session Fixation via OAuth Callback (Medium):**
   - **Flaw:** The route `/oauth-success` blindly reads `?token=XYZ` from the URL and authenticates the browser session. An attacker can craft a malicious link `http://hirex.com/oauth-success?token=<ATTACKER_TOKEN>`. If a victim clicks it, they will unknowingly be logged into the attacker's account. Any data the victim inputs (e.g., resumes) will be saved to the attacker's account.
   - **Fix:** Do not accept raw tokens initialized from public URIs. Use a secure postMessage pop-up flow or rely strictly on secure backend cookies set during the Google callback HTTP redirect phase.
