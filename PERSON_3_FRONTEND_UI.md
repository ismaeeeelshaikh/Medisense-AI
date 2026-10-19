# Person 3: Frontend Architecture, Portals & Clinical UX Lead
**Owner**: Team Member 3  
**Project**: MediSense AI  
**Scope**: React 18 + Vite Web Application, 5 Role-Based Hospital Portals, Dr. Arjun Voice UI (Vapi SDK), Clinical ML Data Visualizations, and Bug Fixes.

---

## 1. Role Overview & Responsibilities
You are responsible for the **client-facing experience** of MediSense AI. Your system bridges complex machine learning models and backend APIs into intuitive, responsive, and secure dashboards tailored to 5 distinct hospital roles.

### Your Key Areas:
1. **5 Role-Specific Portals**:
   - **Patient Portal**: Appointment bookings, personal vitals, Dr. Arjun AI Doctor voice intake.
   - **Doctor Dashboard**: Assigned patients, appointment queue, clinical consultation notes, AI tool suite.
   - **Receptionist Dashboard**: Patient intake, walk-in scheduling, appointment approval & counter-offer workflow, billing invoices.
   - **Lab Technician Dashboard**: Blood test orders, PDF report uploads, automated CBC parameter review.
   - **Hospital Analytics Dashboard**: Real-time bed occupancy, admission trends, and patient risk distributions.
2. **AI Doctor Voice Interface**: Interactive audio visualizer (pulsing orb), real-time transcription stream, and post-call clinical summary card.
3. **Clinical ML Visualizations**: Interactive parameter forms, risk gauges, SHAP factor charts, ECG live waveform player, and Bayesian uncertainty bars.

---

## 2. Directory & Files You Own
Everything inside the `frontend/` directory belongs to you:

```
frontend/
├── src/
│   ├── App.tsx                     # Main router with protected RoleRoute guards
│   ├── main.tsx                    # React DOM root
│   ├── index.css                   # Custom CSS tokens & dark theme palette
│   ├── api/                        # Axios HTTP clients
│   │   ├── aiDoctorApi.ts          # Dr. Arjun call session endpoints
│   │   ├── appointment.api.ts      # Scheduling & counter-offer endpoints
│   │   ├── ml.api.ts               # Clinical ML endpoints
│   │   ├── patient.api.ts          # Patient records & risk level updates
│   │   └── hospitalApi.ts          # Consultations, billing, and lab orders
│   ├── store/                      # Zustand state management
│   │   ├── authStore.ts            # User session, JWT tokens & active role
│   │   └── alertStore.ts           # Real-time clinical alert badges
│   ├── hooks/
│   │   └── useSocket.ts            # Socket.IO connection hook for live doctor alerts
│   ├── layouts/
│   │   ├── AppLayout.tsx           # Authenticated layout with sidebar & topbar
│   │   ├── Sidebar.tsx             # Role-specific navigation sidebar
│   │   └── Topbar.tsx              # User profile, notifications & search
│   ├── components/
│   │   ├── LiveWaveformMonitor.tsx # ECG waveform playback & anomaly flag
│   │   ├── BayesianUncertaintyCard.tsx # Bayesian decision engine & VOI
│   │   ├── FuzzyDosingCard.tsx     # Drug dosing sliders & titration curve
│   │   ├── SymptomChecker.tsx      # Multi-symptom selector & disease ranking
│   │   └── NotificationDrawer.tsx  # Slide-out real-time hospital alert feed
│   └── pages/                      # All 24 page views
```

---

## 3. Immediate Action Items (Bug Fixes & Cleanup)

### Task 1: Fix Dead Link Bug (`/ai-tools` $\to$ `/ml-predictions`)
- [ ] Open `frontend/src/pages/DoctorPatientDetail.tsx`:
  - Locate line 72: `navigate('/ai-tools');`
  - Change to: `navigate('/ml-predictions');`
- [ ] Open `frontend/src/pages/PatientDetailPage.tsx`:
  - Locate line 118: `const openAITools = () => navigate('/ai-tools');`
  - Change to: `const openAITools = () => navigate('/ml-predictions');`
  *(This fixes the bug where clicking "AI Tools" kicked doctors back to the landing page!)*

### Task 2: Delete Irrelevant Research / "Big Data" Page & Fix Routes
- [ ] **Delete file**: `frontend/src/pages/ResearchAnalyticsPage.tsx`
- [ ] Open `frontend/src/App.tsx`:
  - Remove line 30: `const ResearchAnalyticsPage = lazy(...);`
  - Remove line 112: `<Route path="/research-analytics" ... />`
- [ ] Open `frontend/src/layouts/Sidebar.tsx`:
  - In `NAV_BY_ROLE.DOCTOR`: remove the `{ to: '/research-analytics', ... }` item.
  - In `NAV_BY_ROLE.ANALYST`: remove the `{ to: '/research-analytics', ... }` item.

### Task 3: Redesign `AnalyticsPage.tsx` for Real Hospital Operations
- [ ] Open `frontend/src/pages/AnalyticsPage.tsx`:
  - Remove the broken "Hypothesis", "Big Data", and "EDA" tabs.
  - Render **real hospital operational charts** using Recharts:
    1. **Ward & Bed Occupancy**: Bar chart of General, ICU, Cardiac, Maternity occupancy rates (`analyticsApi.getWardOccupancy()`).
    2. **Admission Trends**: 12-month admission volume line/bar chart (`analyticsApi.getAdmissionTrend()`).
    3. **Patient Risk Distribution**: Risk level breakdown across all admitted hospital patients (`analyticsApi.getDashboard()`).
- [ ] Open `frontend/src/api/index.ts`:
  - Clean up `analyticsApi` by removing `getEDA`, `getStats`, `getHypothesis`, and `getBigData`.

---

## 4. Deep Technical Knowledge (How Your Code Works)

### A. Role-Based Navigation & Route Guards (`App.tsx`)
- Protected routes use a higher-order wrapper `RoleRoute`:
  ```tsx
  function RoleRoute({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
      const { user } = useAuthStore();
      if (!user) return <Navigate to="/login" replace />;
      if (!allowed.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;
      return <>{children}</>;
  }
  ```
- If a logged-in Patient attempts to open `/users` or `/doctor-dashboard`, they are automatically routed back to `/patient-portal` without throwing an unhandled error.

### B. Dr. Arjun Voice Interface (`AiDoctorPage.tsx`)
1. **Pre-Call Permission Pre-flight**: The microphone permission is requested the moment the modal opens, eliminating latency when initiating the call.
2. **Vapi Web SDK Integration**:
   - `vapi.on('call-start')`: Transitions status to `active` and initiates the consultation stopwatch.
   - `vapi.on('message')`: Captures real-time speech tokens and renders interim partial transcripts so the patient sees their speech transcribed live.
   - `vapi.on('call-end')`: Gathers final transcript, posts it to `/api/v1/ai-doctor/save-call`, and starts polling for the doctor's structured clinical consultation report.

### C. Clinical ML Tools Suite (`MLPredictionsPage.tsx`)
- Role-gated tool view:
  - **Patients** see self-explanatory tools: CBC Blood Report, Lipid Profile, and Symptom Checker.
  - **Doctors** see clinical decision-support tools: Heart Disease Risk (with fluoroscopy and ST slope inputs), Bayesian Risk Engine, Mamdani Fuzzy Dosing, and ECG Beat Anomaly Monitor.

---

## 5. How to Run & Test Your Frontend

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

- **Frontend Application URL**: `http://localhost:5173`
- Test logging in across different roles (Patient, Doctor, Receptionist, Lab Tech, Admin) to ensure the role-specific sidebar and dashboard render correctly.

---

## 6. Viva / Presentation Q&A Cheat Sheet

> **Q1: How does the AI Doctor voice consultation work on the client side?**  
> **Your Answer**: *"We integrated the Vapi WebRTC SDK. When a patient starts a consultation, audio streams with ultra-low latency directly to speech-to-text models. We capture intermediate partial transcript events to render live speech feedback on screen, while animating a responsive pulsing orb. On call completion, the conversation is automatically sent to the backend for clinical report synthesis."*

> **Q2: Why do patients and doctors see different tabs on the AI Tools page?**  
> **Your Answer**: *"Clinical tools must respect medical ethics and patient safety. Advanced diagnostic instruments like our Bayesian Epistemic Uncertainty engine, Mamdani drug titration controller, and single-beat ECG morphology screen require medical training to interpret properly. Patients are presented with safe, interpretable health summaries (CBC and Lipid charts), while clinicians access the full decision-support suite."*

> **Q3: How is state managed across the application?**  
> **Your Answer**: *"We use Zustand for lightweight, reactive global state. `authStore` maintains JWT tokens, user identities, and role definitions across page refreshes using local storage synchronization. `alertStore` coordinates real-time emergency notifications received over WebSockets, updating badge counts in the top navigation bar without triggering full-page re-renders."*
