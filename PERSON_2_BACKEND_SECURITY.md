# Person 2: Backend Architecture, APIs & Security Lead
**Owner**: Team Member 2  
**Project**: MediSense AI  
**Scope**: Node.js/Express REST APIs, PostgreSQL / Prisma ORM, JWT Authentication & RBAC, Redis, Socket.IO WebSockets, and PDF Generation.

---

## 1. Role Overview & Responsibilities
You are responsible for the **backbone infrastructure** of MediSense AI. Your system handles data persistence, business logic, role-based authorization, real-time alerting, and secure communication between the frontend and the Python ML microservice.

### Your Key Areas:
1. **Relational Database**: PostgreSQL schema design and migrations using Prisma ORM (14 models).
2. **Security & RBAC**: JWT access/refresh token rotation, bcrypt password hashing, ownership checks, and role guards (`SUPER_ADMIN`, `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `LAB_TECHNICIAN`, `PATIENT`).
3. **Microservice Bridge**: Secure internal communication with `ml-service` using the shared header secret `X-Internal-Service-Key`.
4. **Real-time Event Architecture**: Socket.IO server emitting instant alerts for patient risk escalation and appointment approvals.
5. **PDF Engine**: Dynamic generation of clinical consultation PDFs and patient health reports using `pdfkit`.

---

## 2. Directory & Files You Own
Everything inside the `backend/` directory belongs to you:

```
backend/
├── prisma/
│   ├── schema.prisma               # Database models, relations, enums & indexes
│   └── seed.ts                     # Seed data for hospital demo accounts
├── src/
│   ├── app.ts                      # Express server entry point & middleware stack
│   ├── config/                     # Database (Prisma), Redis, Socket.IO, Logger, Env
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT verification & token extraction
│   │   ├── rbac.middleware.ts      # Role-Based Access Control & ownership verification
│   │   ├── rateLimiter.middleware.ts # Redis-backed rate limiting & brute-force defense
│   │   └── errorHandler.middleware.ts # Centralized error handler
│   ├── modules/
│   │   ├── auth/                   # Login, register, logout, refresh token
│   │   ├── patients/               # Patient CRUD, medical history & risk levels
│   │   ├── appointments/           # Appointment requests, approval, scheduling
│   │   ├── consultations/          # Clinical OPD notes, prescriptions & diagnoses
│   │   ├── lab/                    # Lab test orders & test results
│   │   ├── billing/                # Hospital invoicing & payment status
│   │   ├── alerts/                 # Clinical alerts & real-time notifications
│   │   ├── vitals/                 # Vitals recording & time-series retrieval
│   │   ├── ai-doctor/              # Vapi webhook handler & consultation persistence
│   │   ├── analytics/              # Hospital operational KPIs (PostgreSQL queries)
│   │   ├── ml/                     # Proxy client forwarding requests to Python ML service
│   │   ├── reports/                # PDF report generation (pdfkit)
│   │   └── users/                  # User accounts & audit log viewing
│   ├── jobs/
│   │   └── vitalsSimulator.ts      # Background job simulating live ICU patient vitals
│   └── utils/                      # API response helpers, async wrappers
```

---

## 3. Immediate Action Items (Bug Fixes & Cleanup)

### Task 1: Fix Broken Analytics Service (Ghost ML Endpoints)
- [ ] Open `backend/src/modules/analytics/analytics.service.ts`:
  - **Delete** the 4 broken methods that attempt to call non-existent ML routes:
    - `getEDAData()`
    - `getStatsSummary()`
    - `getHypothesisResults()`
    - `getBigDataReport()`
  - **Preserve & Enhance** the working hospital operations methods:
    - `getDashboard()`: Queries real patient counts, high-risk counts, admissions today, unresolved alerts.
    - `getWardOccupancy()`: Computes real bed occupancy percentages across General, ICU, Cardiac, etc.
    - `getAdmissionTrend()`: Calculates 12-month historical patient admissions.
    - `getRiskDistributionOverTime()`: Computes 30-day patient risk progression.
- [ ] Open `backend/src/modules/analytics/analytics.router.ts`:
  - Remove the deleted endpoints (`/eda/distributions`, `/stats/summary`, `/hypothesis/results`, `/big-data/report`).

### Task 2: Remove Dead Hypothesis / Big Data Routes in ML Module
- [ ] In `backend/src/modules/ml/ml.router.ts`:
  - Remove `router.get('/hypothesis-test', ...)` and `router.get('/population-stats', ...)`.
- [ ] In `backend/src/modules/ml/ml.controller.ts`:
  - Remove `runHypothesisTest` and `getPopulationStats`.
- [ ] In `backend/src/modules/ml/ml.service.ts`:
  - Remove `runHypothesisTest` and `getPopulationStats`.

### Task 3: Fix Appointment Approval to Store Rescheduled Date & Time
- [ ] In `backend/src/modules/appointments/appointmentRequest.service.ts`:
  - Update `approve(id: string, scheduledDate?: string, scheduledTime?: string)` so that if the receptionist selects a specific date or time, `updatedRequestedDate` is updated accordingly in the database.

---

## 4. Deep Technical Knowledge (How Your Code Works)

### A. Security Architecture & RBAC Flow
1. **Network Layer Isolation**:
   - The Python ML service is strictly internal. The outside internet cannot reach port 8000.
   - The backend includes an internal secret token:
     ```typescript
     headers: { 'X-Internal-Service-Key': env.ML_SERVICE_INTERNAL_KEY }
     ```
     Any request lacking this header is rejected immediately with `401 Unauthorized`.
2. **Role-Based Access Control**:
   - `authenticate`: Validates JWT Bearer token and attaches `req.user`.
   - `requireRole(...roles)`: Blocks unauthorized roles before the controller runs.
   - `requireOwnership('patient')`: Ensures patients cannot view or alter another patient's medical records or lab tests.

### B. PostgreSQL Database Schema (Prisma)
- **Core Entities**:
  - `User`: System accounts (Doctors, Nurses, Receptionists, Admins, Patients).
  - `Patient`: Clinical medical record (Medical history, chronic conditions, current risk level, vitals).
  - `Admission`: In-patient tracking (Ward type, bed number, admission length).
  - `AppointmentRequest`: Booking lifecycle (`PENDING` $\to$ `APPROVED` or `COUNTER_OFFERED` $\to$ `COMPLETED`).
  - `Consultation`: Doctor's clinical notes, prescribed medications, ICD-10 diagnoses.
  - `LabTestRequest` & `LabTestResult`: Lab order and blood test values.
  - `Invoice` & `InvoiceItem`: Hospital accounting and billing statuses.
  - `AiDoctorCall`: Complete transcript and summary from Dr. Arjun consultations.

### C. Real-Time WebSockets (Socket.IO)
- When a patient's vitals deteriorate or the AI Doctor detects an emergency:
  - `emitRiskEscalation()`: Broadcasts an immediate high-priority alert to the doctor's active browser window.
  - An `Alert` record is persisted in PostgreSQL with severity `CRITICAL` or `EMERGENCY`.

---

## 5. How to Run & Test Your Backend

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Generate Prisma client & sync database
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed demo hospital accounts (Doctors, Patients, Receptionists)
npm run prisma:seed

# 5. Start the backend development server
npm run dev
```

- **API Base URL**: `http://localhost:5000/api/v1`
- **Swagger Documentation**: `http://localhost:5000/api/docs`
- **Prisma Studio (GUI Database Viewer)**: `npx prisma studio`

---

## 6. Viva / Presentation Q&A Cheat Sheet

> **Q1: How do you protect patient medical privacy and prevent unauthorized access?**  
> **Your Answer**: *"We implement Role-Based Access Control (RBAC) and resource-ownership middleware. While staff roles can access records within their departmental scope, patient-facing routes strictly enforce ownership validation. If a logged-in patient attempts to request another patient's lab results, our middleware intercepts the request and terminates it with a 403 Forbidden before reaching the database."*

> **Q2: Why do you have a separate backend and ML microservice instead of running everything in Python?**  
> **Your Answer**: *"Separation of concerns. Node.js with Express and TypeScript is purpose-built for fast asynchronous I/O, WebSocket event streams, authentication, and database orchestration. Python excels at computational machine learning and PyTorch tensor operations. Isolating the ML service behind an internal network key protects heavy computational workloads from blocking user-facing HTTP request cycles."*

> **Q3: How does real-time communication work when an emergency occurs?**  
> **Your Answer**: *"We use Socket.IO. When the AI Doctor transcript scanner flags emergency keywords or vitals simulator detects an acute arrhythmia, the backend emits a `RISK_ESCALATION` WebSocket packet to connected doctor rooms. Concurrently, a persistent alert record is written to PostgreSQL so the alert remains visible in the notification drawer even after page refresh."*
