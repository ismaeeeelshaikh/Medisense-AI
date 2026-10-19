# MediSense AI — Team Work Allocation & Project Guide
**Team Size**: 3 Members  
**Project**: MediSense AI (AI-Powered Clinical Hospital Platform)  
**Documentation Version**: 2.0 (Post-Audit & Optimization)

---

## 1. Executive Summary & Team Structure

To ensure a balanced workload, clean separation of technical concerns, and an impressive project defense during your viva or teacher presentation, the project is structured into three specialized leads:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                MEDISENSE AI TEAM                                 │
└──────────────────────────────────────────────────────────────────────────────────┘
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│        PERSON 1         │       │        PERSON 2         │       │        PERSON 3         │
│  AI, ML & VOICE LEAD    │       │   BACKEND & SECURITY    │       │   FRONTEND & UX LEAD    │
├─────────────────────────┤       ├─────────────────────────┤       ├─────────────────────────┤
│ • Python FastAPI        │       │ • Node.js / Express     │       │ • React 18 / Vite       │
│ • 5 ML Models           │       │ • PostgreSQL & Prisma   │       │ • 5 Role Portals        │
│ • Dr. Arjun Voice & RAG │       │ • Redis Rate Limiting   │       │ • Vapi Voice Interface  │
│ • Safety Guardrails     │       │ • Socket.IO WebSockets  │       │ • Clinical ML Dashboards│
│ • [Read Guide](file:///c:/Users/shaik/medisense-Ai/PERSON_1_AI_ML_VOICE.md)│ │ • [Read Guide](file:///c:/Users/shaik/medisense-Ai/PERSON_2_BACKEND_SECURITY.md)│ │ • [Read Guide](file:///c:/Users/shaik/medisense-Ai/PERSON_3_FRONTEND_UI.md)│
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

---

## 2. Responsibilities at a Glance

| Member | Title | Primary Tech Stack | Primary Files Owned | Key Deliverables |
| :--- | :--- | :--- | :--- | :--- |
| **Person 1** | **AI, ML & Voice Lead** | Python 3.11, FastAPI, PyTorch, Scikit-Learn, XGBoost, pgmpy | `ml-service/` | 5 ML Models, Dr. Arjun Voice Pipeline, TF-IDF RAG, Herb Safety Guardrails |
| **Person 2** | **Backend & Security Lead** | Node.js, Express, TypeScript, PostgreSQL, Prisma, Redis, Socket.IO | `backend/` | REST APIs, 14 DB Models, JWT Auth, RBAC, Real-time Alerts, PDF Engine |
| **Person 3** | **Frontend & UX Lead** | React 18, Vite, TypeScript, Tailwind CSS, Zustand, Recharts | `frontend/` | 5 Role Dashboards, Vapi WebRTC Voice UI, ML Prediction Forms, Bug Fixes |

---

## 3. Discovered Bugs & Clean-Up Tasks (Summary)

The following bugs were uncovered during the technical audit and are assigned to each member:

### Tasks for Person 1 ([Full Details](file:///c:/Users/shaik/medisense-Ai/PERSON_1_AI_ML_VOICE.md)):
- [ ] **Remove Hypothesis Code**: Delete `ml-service/app/api/routes/hypothesis.py` (which mislabeled 1,000 CSV rows as "Big Data").
- [ ] **Clean `ml-service/app/main.py`**: Remove the hypothesis router registration.
- [ ] **Model Integrity**: Verify that `models_manifest.json` matches all saved weights in `ml-service/app/models/`.

### Tasks for Person 2 ([Full Details](file:///c:/Users/shaik/medisense-Ai/PERSON_2_BACKEND_SECURITY.md)):
- [ ] **Fix Broken Analytics Backend**: Remove the 4 dead `mlClient` calls (`/api/analytics/eda`, `/stats`, `/hypothesis`, `/bigdata`) in `backend/src/modules/analytics/analytics.service.ts` that caused 401/404 crashes.
- [ ] **Clean ML Router**: Remove `runHypothesisTest` and `getPopulationStats` from `ml.router.ts`, `ml.controller.ts`, and `ml.service.ts`.
- [ ] **Appointment Rescheduling Fix**: Update `appointmentRequest.service.ts` to properly save new date and time inputs when a receptionist approves an appointment.

### Tasks for Person 3 ([Full Details](file:///c:/Users/shaik/medisense-Ai/PERSON_3_FRONTEND_UI.md)):
- [ ] **Fix Dead Route Bug**: Change `navigate('/ai-tools')` to `navigate('/ml-predictions')` in `DoctorPatientDetail.tsx` (line 72) and `PatientDetailPage.tsx` (line 118).
- [ ] **Delete Research Page**: Remove `frontend/src/pages/ResearchAnalyticsPage.tsx` and delete its route from `App.tsx` and `Sidebar.tsx`.
- [ ] **Repurpose `AnalyticsPage.tsx`**: Replace the broken hypothesis tabs with real hospital operational charts (Bed Occupancy, 30-Day Risk Trends, Patient Admission Volume) connected to working PostgreSQL APIs.

---

## 4. How to Present the Project in Viva / Exam (The Winning Script)

When the examiner asks you to demonstrate your project, follow this 3-step script:

### Step 1 (Person 3 starts with the UI & Portals):
> *"MediSense AI is a complete hospital management and AI clinical support platform. It provides 5 tailored portals. As a patient, you can review personal lab reports, book OPD visits, and consult Dr. Arjun, our voice health assistant. Staff roles have dedicated workflows for receptionist walk-in intake, lab technician CBC uploads, and doctor consultations."*

### Step 2 (Person 1 demonstrates the AI & Safety Pipeline):
> *"Under the hood, we run 5 machine learning models and an AI voice consultation engine. For clinical safety, we never pass unconstrained LLM responses to a patient. We enforce deterministic guardrails: hardcoded herb contraindication screening, automatic emergency detection, and an inter-patient evaluated 1D-CNN ECG screening model evaluated on 22 unseen MIT-BIH patients."*

### Step 3 (Person 2 covers Architecture & Security):
> *"Our architecture maintains strict isolation: the Python ML service is internal and never exposed to the internet, protected by an internal secret key header. The Node.js backend enforces JWT authentication, Redis rate-limiting, and Role-Based Access Control to ensure patient health data is completely secured. Real-time alerts are pushed to active clinicians via WebSockets whenever high risk or critical vitals are detected."*

---

## 5. Quick Links to Member Guides
- 📄 **[PERSON_1_AI_ML_VOICE.md](file:///c:/Users/shaik/medisense-Ai/PERSON_1_AI_ML_VOICE.md)** — Guide for Person 1 (AI & ML Lead)
- 📄 **[PERSON_2_BACKEND_SECURITY.md](file:///c:/Users/shaik/medisense-Ai/PERSON_2_BACKEND_SECURITY.md)** — Guide for Person 2 (Backend & Security Lead)
- 📄 **[PERSON_3_FRONTEND_UI.md](file:///c:/Users/shaik/medisense-Ai/PERSON_3_FRONTEND_UI.md)** — Guide for Person 3 (Frontend & UX Lead)
