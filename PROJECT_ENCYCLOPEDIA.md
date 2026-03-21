# AI-Powered Agentic Hiring Platform - Project Encyclopedia

## 1. Project Overview

### Project Name
AI-Powered Agentic Hiring Platform (HireX)

### Project Purpose
To modernize and automate the recruitment process bridging the gap between job seekers and recruiters through intelligent, AI-driven automation.

### Problem It Solves
Traditional job portals rely on rigid keyword matching, leading to recruiter burnout due to high volumes of irrelevant applications and candidate frustration over "black hole" submissions. This system solves these issues by automating resume intelligence, semantic capability matching, adaptive interviewing, and explainable hiring ranking.

### Target Users
1. **Job Seekers:** Professionals looking for roles suited to their semantic capabilities, needing resume assistance and real-time application tracking.
2. **Recruiters (Company Providers):** Hiring managers seeking to filter thousands of resumes intelligently and automate preliminary scheduling and assessments.

### Key Features
- Multi-Agent AI System for resume and job understanding.
- Semantic Match Scoring (cosine similarity using TF-IDF) between job requirements and candidacies.
- Conversational Job Search and UI agent helpers.
- Automated Interview Scheduling with round-robin balancing and break periods.
- Resume Parsing via `pdf-parse`.

### Core Capabilities
- Dual role-based dashboard system.
- Intelligent shortlisting engine.
- External job aggregation (Adzuna + Jooble integration).
- Real-time profile state-snapshots frozen upon job application.

### Design Philosophy
A user-centric, motion-rich futuristic platform focusing on **Explainable AI** and ethical hiring logic. The architecture aims to automate tedious tasks while providing clear reasoning (match matrices, missing skills) behind every decision, ensuring transparency.

---

## 2. High-Level Architecture

### System Architecture
The platform is built on a decoupled **Client-Server Monolithic Architecture** utilizing customized AI micro-services (Agentic workflows) within the Node.js backend to manage separate functional domains.

### Application Layers
1. **Presentation Layer (Frontend):** React 18 SPA (Single Page Application) powered by Vite. Communicates exclusively via RESTful JSON APIs.
2. **Business Logic Layer (Backend):** Node.js/Express server applying role-guards (RBAC), AI orchestration, caching, and data validation.
3. **Data Layer (Database & Cache):** PostgreSQL (hosted on Neon) serving as the primary relational persistence store, supplemented by Redis for session caching and rapid analytics warming.

### Interaction Between Frontend, Backend, and Database
The React Frontend issues HTTP requests (Axios) with JWT tokens. The Express Backend middleware validaties JWTs, verifies target resource ownership against the requesting `user_id`, processes logic or orchestrates AI services (using Groq, Google Generative AI, or internal algorithms), queries PostgreSQL via `pg` pool, caches responses in Redis, and returns structured JSON to the client.

### Data Flow Across the System & Request Lifecycle
1. **Request:** Frontend triggers API action (e.g., `POST /api/jobs/:id/apply`).
2. **Middleware:** `auth.js` verifies JWT; `roleGuard.js` authenticates 'job_seeker' intent.
3. **Controller:** Validates payload (resume choice, answers).
4. **Service:** Freezes a snapshot of the candidate's profile to preserve state historically.
5. **Database:** Persists application in `job_applications` and linking tables in PostgreSQL.
6. **Response:** Resolves back to client, updating the UI application trackers.

---

## 3. Tech Stack Analysis

### Frontend
- **Frameworks:** React 18, Vite
- **Libraries:** `axios`, `lucide-react`, `react-router-dom`, `agora-rtc-sdk-ng` (WebRTC Video), `@dnd-kit/core`
- **Styling Tools:** Tailwind CSS, `clsx`, `tailwind-merge`
- **State Management:** React Context API
- **Routing:** React Router DOM (v6)
- **UI & Animations:** Framer Motion, `@tsparticles/react`, `recharts`, `reactflow`

### Backend
- **Language:** JavaScript (Node.js ES6 Modules)
- **Framework:** Express.js
- **Server Architecture:** RESTful Monolith with integrated background agent orchestration
- **Middleware:** 
  - `cors`: Handles cross-origin filtering
  - `multer`: Intercepts and limits multipart/form-data (Resumes, Avatars)
  - `passport` / `passport-google-oauth20`: Handles OAuth flows
  - `express-rate-limit`: Prevents brute force

### Database
- **Type:** PostgreSQL (Relational)
- **ORM/Query Builder:** Native SQL via `pg` library (Connection Polling, parameterized queries)
- **Schema Management:** Custom manual migration scripts (`setup-schema.js`, `/migrations/**/*.js`)
- **Cache Layer:** Redis (`redis` package) for session payload caching and dash-warming

### AI / ML
- **Text Processing & Math:** `natural` (Tokenization, TF-IDF vectorization, Cosine similarity)
- **Document Parsers:** `pdf-parse` (Resumes), `mammoth` (Docx), `pdf-lib`, `pdfkit`
- **Generative AI & LLMs:** 
  - `@google/generative-ai` (Gemini 1.5-flash for explanation narratives)
  - `groq-sdk` (Fast contextual parsing)

### DevOps / Infrastructure
- **Deployment Environments:** Vercel (Frontend), Render/Neon (Backend network bindings concept).
- **Version Control & CI/CD:** Git

### Tools
- **Build Tools:** Vite
- **Package Managers:** npm
- **Linters/Formatters:** ESLint (`eslint.config.js`), PostCSS

---

## 4. Repository Detailed Structure

### `/frontend`
Holds the React presentation logic. Contains its own `package.json`.
- `/src/pages`
  - `/admin` - Unfinished Phase 7.5 pages (`AdminDashboard`, `UserManagement`)
  - `/user` - Job Seeker pages (`Profile`, `JobDiscovery`, `ApplicationTracker`, `AIActions`, `CodingTestAttempt`)
  - `/provider` - Recruiter pages (`ProviderDashboard`, `JobPosting`, `ApplicantManagement`, `InterviewScheduler`, `AutoShortlist`)
- `/src/components` - Shared UI building blocks (`Button`, `JobApplyModal`, `ApplicantCard`)
- `/src/routes/AppRoutes.jsx` - Core Router with strict `<ProtectedRoute allowedRoles={[...]} />` barriers.
- `/src/contexts` - React context providers (`AuthContext.jsx`, `ProviderToastContext.jsx`).
- `/src/api` - Axios interceptors binding to `process.env.VITE_API_URL` passing Bearer tokens.

### `/backend`
Houses the Node API, DB connections, and Agentic orchestration. Contains its own `package.json`.
- `/routes` - Express router controllers mapping to endpoints.
  - `auth.js` - Registration, JWT Login, Google OAuth, Session Warmup.
  - `jobs.js` - CRUD for `job_postings`, deduplicated unifying external APIs (`/api/jobs/india`).
  - `applications.js` - Submitting applications, recruiter viewing scopes, snapshotting profiles.
  - `aiToolsRoutes.js` & `aiResumeRoutes.js` - Endpoint exposures for AI execution.
- `/services` - Heavy computational Singletons.
  - `aiShortlistService.js` - Performs NLP Tokenization, Cosine Similarity matching, and wraps Gemini API for narrative generation.
  - `schedulingAlgorithm.js` - Math algorithms for round-robin interview gap mapping.
  - `adzunaService.js` / `joobleService.js` - External API wrappers.
- `/config` - Core initialization singletons (`db.js`, `redis.js`, `passport.js`).
- `/middleware` - Active route interception (`auth.js` verifies JWT, `roleGuard.js` verifies string role matches).
- `/migrations` & `/scripts` - Direct DB DDL execution scripts.
- `/uploads` - Ephemeral local storage holding PDFs before `pdf-parse` reads them into memory.

---

## 5. UI/UX Pages & Navigation Map

**Frontend Routing Pattern:** Utilizing `react-router-dom` with explicit `<ProtectedRoute>` middleware checking global context state. Uses lazy loading via `React.Suspense` for massive chunk optimizations.

### Public Routes
- `/login`, `/register`: Handled by unified conceptual design. Calls `/api/auth/login`.

### Job Seeker Portal (`/user/*`)
Protected via `roleGuard(['job_seeker'])`.
- `/user/dashboard` (`UserDashboard.jsx`): Central telemetry showing Application Tracking counts.
- `/user/profile` (`Profile.jsx`): CRUD for user. Includes heavy `<form>` uploads hitting `/api/candidates/me`.
- `/user/jobs` (`JobDiscovery.jsx`): Internal jobs aggregated from `job_postings`.
- `/user/jobs-in-india` (`JobsInIndia.jsx`): External aggregated list utilizing the Adzuna/Jooble backend merge map.
- `/user/applications` (`ApplicationTracker.jsx`): Status boards.
- `/user/interviews` (`InterviewsPage.jsx`): Live video room tracking.
- `/user/tests` (`MyTestsPage.jsx`), `/user/coding-tests` (`CandidateCodingDashboard.jsx`): Interactive examination portals.
- `/user/ai-actions` (`AIActions.jsx`): Specific UI area for triggering AI Resume rewrites or mock interview generation.

### Recruiter / Job Provider Portal (`/provider/*`)
Protected via `roleGuard(['recruiter'])`. Wrapped in custom `ProviderToastContext`.
- `/provider/dashboard` (`ProviderDashboard.jsx`): Metrics overview (Views, applications, active jobs).
- `/provider/post-job` (`JobPosting.jsx`): Complex Multi-step form writing to `job_postings`, `job_requirements`, and `job_questions`.
- `/provider/applicants` (`ApplicantManagement.jsx`): CRM interface viewing historical `job_application_profile_snapshot` to avoid candidate tampering after applying.
- `/provider/ai-tools` (`AITools.jsx`): Master portal.
  - `/provider/ai-tools/auto-shortlist` (`AutoShortlist.jsx`): Triggers the TF-IDF and Gemini engine on the backend. Renders percentage scores and natural language justifications.
  - `/provider/ai-tools/interview-scheduler` (`InterviewScheduler.jsx`): Triggers mathematical algorithm organizing 15/30m slots.
- `/provider/company` (`CompanyProfile.jsx`): Modifies the `companies` table. Essential requirement before posting jobs.
- `/provider/tests`, `/provider/coding-tests`: Examination authoring screens.

### Admin Portal (`/admin/*`)
*Partially Implemented (Phase 7.5 Status)*.
- `/admin/dashboard`, `/admin/users`, `/admin/jobs`, `/admin/applications`

### Shared Routes
- `/interview/:channelName` (`InterviewRoom.jsx`): Dual Authorized route utilizing WebRTC (Agora concepts) for live video calls.

---

## 6. Global React State & Context

- **`AuthContext.jsx`**: Centralized authentication store. Holds `user` (id, email, role) and `isAuthenticated`. Handles login, logout, and automatic JWT token injection into `axios` interceptors.
- **`ProviderToastContext.jsx`**: Specialized UI feedback provider for recruiter views. Uses `framer-motion` to render custom notifications (`success`, `error`, `info`) without relying on global unstyled alerts.
- **Axios Interceptors (`/api/index.js`)**: Automatically intercepts every outgoing `XHR/Fetch` replacement request formatting the header to include `Authorization: Bearer <token>`, routing traffic strictly to `VITE_API_URL`.

---

## 6. UI Element Documentation

### Landing Page (`/`)
- **Header Navigation (Nav)**: Location: Top screen. Links to Product, Solutions, Pricing.
- **Login Button**: Location: Top-Right. Action: Redirects to `/login`.
- **Hero CTA Buttons ("Find Jobs", "Start Hiring")**: Location: Center. Action: Triggers `/login` routing.
- **Features Grid**: Location: Middle body. Non-interactive description cards analyzing internal platform tools.

### Auth Page (`/login`)
- **Role Toggle**: Location: Form Top. Purpose: Switches Registration scope between "Job Seeker" and "Recruiter". State Change: Adjusts `intent` state.
- **Email/Password Input Fields**: Captures auth data.
- **Submit Button**: Action: Triggers `POST /api/auth/login` or `register`. State changes to loading, resolves by mutating `AuthContext` and pushing user to `/[role]/dashboard`.
- **Google OAuth Button**: Action: Relays user to `GET /api/auth/google`.

### Job Seeker: Job Discovery (`/user/jobs`)
- **Search Input Field**: Location: Top bar. Purpose: Keyword filter for roles. 
- **Location Toggle/Input**: Filters based on geography.
- **Job Card List**: Location: Core canvas. Displays job abstracts.
- **"Save Job" Button**: Location: Job Card. Action: Bookmarks job.
- **"Apply Now" Button**: Location: Job Card. Action: Opens Applicant Modal (`JobApplyModal.jsx`). Triggers `POST /api/jobs/:id/apply` passing user answers and resume payload.

### Recruiter: Job Posting (`/provider/post-job`)
- **Form Inputs (Job Title, Type, Location, Description)**: Standard text fields managed by local React state.
- **"Add Custom Question" Button**: Location: Form body. Action: Mounts new dynamic question fields to state array.
- **"Publish Job" Submit Button**: Location: Form Footer. Action: Triggers `POST /api/jobs` mutating DB `job_postings`.

### Recruiter: AI Auto-Shortlist (`/provider/ai-tools/auto-shortlist`)
- **Select Job Dropdown**: Location: Header. Selects which job to trigger AI matching on.
- **"Run AI Shortlist" Button**: Action: Triggers `POST /api/ai-tools/shortlist/:jobId`. Iterates through applications and executes cosine similarity parsing.
- **Candidate Match Cards (Table)**: Location: Body. Displays Candidate Name, Match Score (%), and Missing Skills.

### Recruiter: Interview Scheduler (`/provider/ai-tools/interview-scheduler`)
- **Interviewer Input**: Location: Settings form. Adds hiring managers to round-robin pool.
- **Break Duration Toggle**: Configures intervals between back-to-back interviews.
- **"Schedule Top 10" Button**: Location: Bottom right. Action: Calls `/api/interviews/schedule/:jobId` binding DB rows in `interviews` table.

---

## 7. Backend Deep Analysis

### Backend API Communication Flow
1. **Frontend Request:** Axios calls `http://localhost:3000/api/...` passing `{ headers: { Authorization: "Bearer <JWT>" } }`.
2. **Middleware Intercept:** `auth.js` verifies JWT via `jsonwebtoken.verify`. Injects `req.user`.
3. **RoleGuard Intercept:** `roleGuard('job_seeker')` checks if `req.user.role === 'job_seeker'`. Rejects 403 if failed.
4. **Route Controller:** Extracts payload (e.g. `req.body.resume_id`). Hits Cache (Redis) if applicable.
5. **Database Execution:** Utilizing `pg`, safe parameterized SQL (e.g., `INSERT INTO ... VALUES ($1, $2)`) executes.
6. **Background Worker/Service:** If it's an AI route, controller delegates to Services (e.g. `aiShortlistService.js`).
7. **Cache Invalidation:** Route executes `deleteCache()` for corresponding Redis keys.
8. **Response:** Resolves back JSON `{ success: true, payload: ... }`.

### Thorough API Routes Documentation

**Authentication (`/api/auth`)**
- `POST /register`: Registers User (`email`, `password`, `intent`). Converts intent to role. Inserts into `credentials`.
- `POST /login`: Validates password (`bcrypt.compare`). Generates JWT. Triggers `warmupSessionCache()` (background Redis sync).
- `GET /me`: Returns normalized User dict.
- `GET /google` & `/google/callback`: Passport OAuth2 wrappers handling SSO.

**Jobs (`/api/jobs`)**
- `GET /india`: Unified live API search routing directly to out-of-ecosystem Adzuna & Jooble wrappers. Removes duplicates via string normalization maps.
- `GET /`: Internal PG `job_postings` fetch.
- `POST /` [Auth: Recruiter]: Commits a new Job. Writes to `job_postings`, `job_requirements`, `job_questions`, and `job_expectations`.
- `GET /recruiter` [Auth: Recruiter]: Enforces Data Ownership. Selects jobs strictly tied to `WHERE company_id = [Recruiters Company]`.
- `PUT /:id` [Auth: Recruiter]: Modifies an existing Job. Employs a specific soft-delete/upsert algorithm for changing Job Screening Questions.
- `PATCH /:id/status` & `DELETE /:id`: Flags status or Soft-deletes.

**Applications (`/api/applications` / `/api/recruiter/*`)**
- `POST /jobs/:id/apply` [Auth: Job Seeker]: 
  1. Validates `status === 'Open'`.
  2. Creates Application row in `job_applications`.
  3. **Crucial Step:** Freezes realtime profile skills explicitly into JSON `job_application_profile_snapshot`.
  4. Commits `job_application_answers` for custom recruiter questions.
- `GET /applications/my-applications` [Auth: Job Seeker]: Pulls historic applied tracker data.
- `GET /recruiter/applications` [Auth: Recruiter]: Pulls all apps belonging to Recruiter's company jobs.
- `PATCH /recruiter/applications/:id/status` [Auth: Recruiter]: Modifies status (`applied`, `interview`, `rejected`). Triggers Interview Row generation if updated to `interview`.
- `GET /recruiter/applications/:id/profile-snapshot` [Auth: Recruiter]: Prevents candidate resume alterations from modifying historic job apps by serving the static frozen JSON fallback.

**AI & Tools (`/api/ai-tools` / `/api/ai`)**
- `POST /ai-tools/shortlist/:jobId`: Triggers the agentic `aiShortlistService.js`. Iterates over all candidates, parses PDF text, runs TF-IDF calculations, calls Google Gemini for the natural language summary explanation, and returns a sorted rank-array.

---

## 8. Database Architecture Deep Dive

### Engine Details
PostgreSQL Relational Storage. Controlled heavily via raw parameterized SQL via the `pg` library. Does not use an ORM (like Prisma/Sequelize), opting for explicit query tuning. Includes explicit JSON payload caching into Redis via `{ utils/cache.js }`.

### Detailed Table Schemas & Relationships

1. **`credentials`** (Core Auth Base)
   - `id` (UUID, PK)
   - `email` (VARCHAR 255, UNIQUE)
   - `password_hash` (VARCHAR 255)
   - `role` (VARCHAR 50: 'admin', 'job_seeker', 'recruiter')
   - `is_verified` (BOOLEAN)

2. **`candidates`** (Job Seeker Profile)
   - `id` (UUID, PK) The specific candidate system ID.
   - `user_id` (UUID, FK -> credentials.id)
   - `resume_pdf` (TEXT) Points to specific file uploads.
   - `skills` (TEXT[]) Postgres String Array format housing explicit known capabilities.
   - Contains flattened profile columns (`experience_years`, `degree`, `institution`, `github_url`).

3. **`companies`** (Recruiter Company Base)
   - `id` (UUID, PK)
   - `created_by` (UUID, FK -> credentials.id)
   - `name`, `industry`, `logo` (BYTEA - historically kept as base64 conversion wrappers).

4. **`job_postings`** 
   - `job_id` (BIGINT, PK)
   - `company_id` (UUID, FK -> companies.id)
   - `job_title`, `department`, `job_description`, `required_skills` (TEXT)
   - `require_education`, `require_skills` (BOOLEAN triggers)

5. **`job_requirements` & `job_questions`**
   - Tables bound (FK -> job_postings `CASCADE`) hosting dynamic string arrays configuring exactly what custom answers a candidate must fill during `/apply`.

6. **`job_applications`** (The Nexus Table)
   - `id` (UUID, PK)
   - `job_id` (FK -> job_postings)
   - `candidate_id` (FK -> candidates)
   - `company_id` (FK -> companies)
   - `resume_url`, `status` (VARCHAR DEFAULT 'applied')
   - `applied_at` (TIMESTAMPTZ)
   - *Constraint:* `UNIQUE (job_id, candidate_id)` prevents multi-applying.

7. **`job_application_profile_snapshot`**
   - `id` (UUID, PK)
   - `application_id` (FK -> job_applications.id)
   - `profile_snapshot` (JSONB) Stores static object of the candidate profile.

8. **`job_application_answers`**
   - Stores specific raw text responses candidate wrote to fulfill `job_questions`.

9. **`interviews`**
   - `id` (UUID, PK)
   - `application_id` (FK -> job_applications)
   - `channel_name` (VARCHAR) Bound to Agora WebRTC channels.
   - `interviewer_name`, `start_time`, `end_time` (TIMESTAMPTZ)

### Expected Data Flow Execution
When Job Seeker Registers -> Recruiter Registers -> Recruiter creates Company -> Recruiter creates Job (`job_postings` + `job_questions`) -> Job Seeker views -> Seeker Applies -> `job_applications` generated preventing duplicate inserts utilizing `UNIQUE` constraint -> DB creates `profile_snapshot` freezing time -> Recruiter triggers AI Matching -> System loops through `job_applications` and calculates math between `job_postings.required_skills` and `candidates.skills`.

---

## 9. Authentication and Authorization

### Login Systems
1. Standard Email / Password (using `bcryptjs` for salting/hashing).
2. Google OAuth 2.0 (using `passport-google-oauth20`).

### Authentication Method
Stateless JSON Web Tokens (JWT). The token carries the `userId`, `email`, and crucially, the `role`. 
Redis is utilized alongside Auth to **warmup** the cache context. Upon login, DB profiles are instantly mapped to Redis allowing <5ms latency on subsequent dashboard loads.

### Access Control (Roles)
- **Job Seeker**: Allowed to view jobs, apply, update personal candidate profiles. Blocked from viewing company internal applications.
- **Recruiter**: Allowed to post jobs, execute AI rankings on owned jobs, interact with `job_applications` specific to their `company_id`.

---

## 10. Business Logic

### Job Application Workflow
1. User searches `JobDiscovery`.
2. Selects "Apply". Modal evaluates if candidate missing required skills.
3. Candidate submits answers to dynamic `job_questions`.
4. System takes a "Profile Snapshot" freezing the candidates current skills/experience, preventing historical profile alterations from modifying old application contexts.

### AI Resume Shortlisting
1. Recruiter clicks "Auto Shortlist".
2. System extracts `description` and `required_skills` from Job.
3. System iterates all Applications for that Job.
4. Passes candidate's frozen context + resume parse text against the Job context.
5. Uses Term Frequency-Inverse Document Frequency (TF-IDF) mapping resolving a Cosine Similarity percentage.
6. Returns sorted array back to recruiter UI.

---

## 11. API Communication Flow

Frontend initiates XHR requests via Axios intercepts attaching the JWT `Authorization: Bearer <token>`.
Backend validates token -> Orchestrates Database Pool query -> Processes Payload -> Returns JSON object `{ success: true, payload: [...] }`.

---

## 12. File Handling System

**Uploads** are handled via `multer` middleware.
- **Strategy:** Local FileSystem storage inside `/backend/uploads/`.
- **Resumes:** PDFs are intercepted, saved locally, parsed using `pdf-parse` into text, text is embedded into candidate DB profiles, and the file pointer (`resume_url`) is persisted.
- **Images:** Company logos / User avatars are parsed into base64 encodings and dynamically served directly from DB/Redis avoiding complex CDN setups for early architecture.

---

## 13. AI / Automation Systems

- **Match Ranking Agents:** Operates strictly on mathematical NLP parsing (`natural` library TF-IDF), skipping API latency of external LLMs for bulk processing algorithms.
- **Chatbot & Cover Letter Agents:** UI interfaces utilize external APIs (`groq-sdk` or `Google Gemini`) via system prompt wrappers asking it to analyze the parsed Candidate Profile JSON and Job Description to format automated letters.

---

## 14. Security Design

- **Passwords:** `bcryptjs` 10 salt rounds.
- **Queries:** All DB execution strictly employs `pg` parameterized querying (`WHERE id = $1`) preventing SQL injection.
- **Segregation Verification:** APIs enforcing modifying/getting resources (e.g. `GET /api/recruiter/jobs/:id/applications`) hard-verify ownership (`WHERE company.created_by = $1`).

---

## 15. Environment Configuration
Backend `.env` defines:
`PORT`, `DATABASE_URL` / `NEON_DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `FRONTEND_URL`, API Keys (`ADZUNA_API_KEY`, `JOOBLE_API_KEY`, `GROQ_API_KEY`, `GOOGLE_GEMINI_KEY`).

---

## 16. Deployment Architecture
Designed to be decoupled.
- Frontend: Static export compliant, ideal for Edge CDNs (Vercel/Netlify).
- Backend: Node environment binding to Network Interfaces, requires containerization capability or PaaS routing (Render, Railway).
- DB: Fully cloud abstract via Neon Tech Serverless Postgres limits scaling pain points. Redis caches provide robust traffic smoothing.

---

## 17. Development Workflow

**Local Setup:**
1. Populate `.env` in backend.
2. Term 1: `cd backend && npm run dev` (Runs `nodemon`).
3. Term 2: `cd frontend && npm run dev` (Runs `vite`).
Schema configurations can be executed dynamically using `/scripts/setup-schema.js` eliminating complex manual SQL dumps.

---

## 18. Integration Points

1. **Adzuna / Jooble:** Used in `JobsInIndia.jsx` providing a fallback pool of external job listings to enrich platform content.
2. **Google OAuth:** Social Login.
3. **Agora RTC:** Facilitates Video integrations inside `InterviewRoom.jsx`.
4. **Groq / Google AI:** External intelligence processing modules.

---

## 19. Error Handling System

1. **Backend:** Global Express `.use(err, req, res, next)` hook traps uncaught service errors, preventing crashes and resolving `500 Server Error` formatted JSON objects. `process.on('unhandledRejection')` avoids server deaths based on DB pooling disconnects.
2. **Frontend:** API requests wrap in `try..catch`, injecting UI `Toast` contexts directly to the user indicating failures (e.g., "Network Error", "Missing Permissions").

---

## 20. Performance Considerations

1. **Redis Caching:** Massive performance gain via session cache warmup. Upon login, the entire profile context builds into Redis memory bypassing standard relational joins entirely during general navigation.
2. **Pagination:** Frontend UI implementations paginating massive lists.
3. **API Rate Limiting:** Bound to Auth and Upload routes to prevent DDoS or DB spam vectors.

---

## 21. Known Limitations

- Realtime UI Notifications (websockets/polling) natively absent, requiring manual page refreshes in some tracker screens.
- AI Actions logic (Skill Gap calculation) relies on heavy text processing rendering high backend CPU usage synchronously during bulk Auto-Shortlisting. 
- Local `/uploads/` reliance limits horizontal server scaling without a shared volume/S3 migration.

---

## 22. Future Improvements

1. **S3 / Cloud Storage:** Migrate `/uploads` handling to presigned AWS S3 uploads to fully abstract the Node server into serverless functions.
2. **WebSockets:** Implement `Socket.io` for seamless UI notifications regarding interview schedule updates.
3. **Asynchronous Task Queuing:** Move AI Ranking algorithms into a queue (`BullMQ`) offloading processing to worker containers instead of tying up the HTTP request pool.
4. **Automated Reference Check Workflows:** Extending the system database footprint for pre-offer stages.

---

## 23. Comprehensive Portal Walkthroughs (The 3 Logins)

The platform enforces strict isolation between its three primary user archetypes. The login entry point (`/login`) evaluates the credentials payload against the `credentials` table, returns a stateless JWT bearing the `role`, and triggers React Router (`<ProtectedRoute />`) to push the user into their respective dashboard.

### A. Job Seeker Login & Portal
**Role Assignment:** `job_seeker`
**Primary Objective:** Maintain a digital resume representation, discover jobs (internal & external), apply with frozen snapshot states, and execute AI actions to land interviews.

1. **User Dashboard (`/user/dashboard`)**
   - **UI & Layout:** A telemetry-focused hub. Features interactive stat cards (Applications Sent, Interviews Scheduled, Saved Jobs).
   - **Buttons & Functions:** `[View Applications]` quick-links directly to the tracker.
   - **How it works:** Fires an axio request to `GET /api/applications/my-applications`. The backend computes the counts dynamically and returns them rapidly thanks to Redis session caching.

2. **Profile Management (`/user/profile`)**
   - **UI & Layout:** A multi-tab interface segmenting Personal Details, Experience, Education, and Skills.
   - **Buttons & Functions:** 
     - `[Upload Resume]`: Opens OS file picker.
     - `[Save Changes]`: Dispatches mutated form state to the server.
   - **How it works:** Submitting the form triggers `PUT /api/candidates/me`. For resumes (PDFs), the `multer` middleware intercepts the binary, stores it in `/backend/uploads/`, and synchronously executes `pdf-parse`. The extracted raw text is fed through the `natural` NLP tokenizer to index the candidate's skills before saving to PostgreSQL. 

3. **Job Discovery (`/user/jobs` & `/user/jobs-in-india`)**
   - **UI & Layout:** Highly filterable search interfaces. `/user/jobs` shows internal DB postings. `/user/jobs-in-india` serves as the global aggregator. 
   - **Buttons & Functions:** 
     - `[Search]`: Filters list locally or via server queries.
     - `[Save]`: Bookmarks the job to local storage or DB.
     - `[Apply Now]`: Triggers the dynamic `JobApplyModal.jsx`.
   - **How it works:** The external aggregator (`JobsInIndia.jsx`) hits `GET /api/jobs/india`. The backend concurrently invokes `fetchAdzunaJobs()` and `fetchJoobleJobs()`, merges the arrays, performs deep string deduplication (to prevent identical jobs from showing twice), and returns the unified list.

4. **Job Apply Modal (`JobApplyModal.jsx`)**
   - **UI & Layout:** A sliding or pop-up modal requiring the user to select their desired resume variant and answer Recruiter-defined custom screening questions.
   - **Buttons & Functions:** `[Submit Application]`.
   - **How it works:** Hits `POST /api/jobs/:id/apply`. Validates constraints (e.g., `require_education === true`). Crucially, it takes a **Profile Snapshot**—a literal deep-copy (`JSON.stringify`) of the candidate's active profile and saving it into `job_application_profile_snapshot`. This guarantees to the recruiter that whatever the candidate looked like at the exact moment of application cannot be tampered with later.

5. **AI Actions Portal (`/user/ai-actions`)**
   - **UI & Layout:** Input field requesting a target Job Description. Output display pane.
   - **Buttons & Functions:** `[Optimize Resume]`, `[Generate Cover Letter]`.
   - **How it works:** Merges the candidate's JSON profile and the provided Job Description into an engineered prompt. Dispatches the prompt to `groq-sdk` or `Google Generative AI` to stream a high-quality, ATS-optimized cover letter directly onto the user's screen.

6. **Interview Tracking (`/user/interviews`)**
   - **UI & Layout:** Chronological list of upcoming scheduled virtual meetings.
   - **Buttons & Functions:** `[Join Room]`.
   - **How it works:** Parses the `interviews` table. Clicking "Join" routes the user to `/interview/:channelName`, initializing the Agora WebRTC video conferencing hooks.

---

### B. Job Provider (Recruiter) Login & Portal
**Role Assignment:** `recruiter`
**Primary Objective:** Establish a corporate identity, publish dynamic job screenings, manage candidate funnels securely, and offload massive review tasks to the AI Shortlist/Scheduling engines.

1. **Company Profile Setup (`/provider/company`)**
   - **UI & Layout:** Essential business intake form.
   - **Buttons & Functions:** `[Save Company Profile]`.
   - **How it works:** `POST /api/companies`. This is a hard prerequisite enforced by the backend API. If a recruiter attempts to post a job without an associated `company_id` row in the DB, the server violently rejects the request with a `400` status.

2. **Provider Dashboard (`/provider/dashboard`)**
   - **UI & Layout:** CRM-style metrics (Total Active Jobs, Funnel Drop-offs, Outstanding Interviews). 
   - **How it works:** Aggregates metrics utilizing Redis caching (`cacheKeys.providerDashboard(userId)`). Uses `roleGuard` middleware to ensure the DB query strictly attaches `WHERE company.created_by = userId`, isolating data perfectly between competitive competing recruiters.

3. **Job Posting Engine (`/provider/post-job`)**
   - **UI & Layout:** A complex multi-step form wizard.
     - *Step 1:* Fundamentals (Title, Location, Salary).
     - *Step 2:* Screening Requirements (Hard toggles for Education/Skills).
     - *Step 3:* Custom Question Builder.
   - **Buttons & Functions:** 
     - `[Add Custom Question]`: Mounts dynamic React state defining question formats (Boolean, Text, Dropdown).
     - `[Publish Job]`.
   - **How it works:** Triggers `POST /api/jobs`. The backend initiates a Postgres Transaction (`BEGIN`). It writes to `job_postings`, maps over the custom questions array to populate `job_questions`, and commits (`COMMIT`). If any insert fails, it executes `ROLLBACK` to prevent orphaned DB rows.

4. **Applicant Management CRM (`/provider/applicants`)**
   - **UI & Layout:** Table/Kanban hybrid. Clicking a candidate expands a highly detailed slide-out drawer rendering the PDF resume securely and showing the `job_application_profile_snapshot`.
   - **Buttons & Functions:** 
     - Status Modifier Dropdown: Transitions states (`applied` -> `shortlisted` -> `interview` -> `rejected`).
   - **How it works:** Triggers `PATCH /api/recruiter/applications/:id/status`. If the recruiter selects `interview`, the backend intercepts this and automatically spins up an un-scheduled, pending record in the `interviews` table with a newly generated, unique `channel_name` for the future video call.

5. **AI Auto-Shortlist Sandbox (`/provider/ai-tools/auto-shortlist`)**
   - **UI & Layout:** Job selector interface leading to a ranked Candidate Match Data Grid highlighting Match Scores (%) and missing dependencies.
   - **Buttons & Functions:** `[Run AI Shortlist]`.
   - **How it works:** The most computationally expensive route (`POST /api/ai-tools/shortlist/:jobId`).
     1. Loads the Job specs (`required_skills`).
     2. Iterates over every single application linked to the job.
     3. Feeds the candidate's PDF parsed text and snapshot array into the `aiShortlistService.js` singleton.
     4. Calculates skill match, absolute experience gap, and term frequency-inverse document frequency (TF-IDF) via the `natural` library to derive a base score (e.g., 85%).
     5. Calls the `Google Gemini 1.5` model, passing the scoring arrays to organically generate a 2-sentence written narrative explaining *why* they scored an 85% to the recruiter.

6. **AI Interview Scheduler (`/provider/ai-tools/interview-scheduler`)**
   - **UI & Layout:** Logistics interface requiring standard business hours block inputs and a list of internal interviewers.
   - **Buttons & Functions:** `[Schedule Top 10 Candidates]`.
   - **How it works:** Hits `POST /api/interviews/schedule/:jobId`. The `schedulingAlgorithm.js` maps candidate availabilities against recruiter slots, distributing the workload evenly (Round-Robin) between multiple interviewers while explicitly enforcing break-period configurations automatically updating the `interviews` table.

---

### C. Admin Login & Portal (System Owner)
**Role Assignment:** `admin`
**Primary Objective:** *Note: This portal is in Phase 7.5 architectural status.* The objective is complete platform moderation, metric oversight, and dispute resolution.

1. **Admin Dashboard (`/admin/dashboard`)**
   - **UI & Layout:** System-level "God Mode" charts. Active connections, Total processing load, server health indicators.
   - **How it works:** Bypasses standard scope restrictions (`roleGuard('admin')`). Queries `COUNT(*)` across massive table hierarchies to build topological graphs of platform utilization.

2. **User & Content Management (`/admin/users`, `/admin/jobs`)**
   - **UI & Layout:** Infinite-scroll paginated data grids exposing all cross-platform data.
   - **Buttons & Functions:** 
     - `[Ban User]`: Flags `credentials.is_verified = false` locking the account.
     - `[Take Down Job]`: Forces `job_postings.status = 'deleted'`.
   - **How it works:** Bypasses the `company_id` relational checks that recruiters are bound to, executing hard DB mutations to scrub explicitly violative platform content.
