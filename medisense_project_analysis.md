# MediSense AI - Project Analysis & Technical Guide

This document is a comprehensive guide to understanding the **MediSense AI** project. It is designed to help you explain the project's architecture, ML models, and workflow to your teachers or examiners.

---

## 1. Project Overview
**MediSense AI** is an AI-assisted hospital management platform. Its core feature is **Dr. Arjun**, a Hindi/English/Hinglish speaking voice health assistant that takes a patient's medical history (like an OPD consultation). The platform has 5 different user roles (Patient, Doctor, Receptionist, Lab Technician, Admin) and integrates 5 trained Machine Learning models to assist doctors with clinical tools.

**IMPORTANT NOTE FOR EXAMINERS**: This is an academic project. It is not a medical device. It does not diagnose or prescribe medicines. All outputs are meant to be reviewed by a qualified doctor.

---

## 2. Machine Learning Models (Deep Dive)
The project uses 5 specific ML models. The metrics for these models are strictly read from `models_manifest.json`, ensuring the UI always shows real, verifiable numbers.

### A. Heart Disease Risk Model
*   **Purpose**: Predicts the probability of a patient having heart disease based on 13 clinical features (like age, cholesterol, chest pain type, max heart rate, etc.).
*   **Algorithm**: XGBoost
*   **Dataset**: 1,025-row cardiac dataset (`HeartDiseaseTrain-Test.csv`).
*   **Accuracy**: 95.5% (ROC-AUC: 0.9947).
*   **Crucial Insight / Limitation to explain**: The dataset used is a popular public dataset that is very "clean". While the 95.5% accuracy is real, it reflects the simplicity of the dataset. In a real hospital, patient data is much noisier. The scaler for the data was carefully fit *only* on the training data to prevent "data leakage" (a common mistake in student projects).

### B. Symptom Checker Model
*   **Purpose**: Takes selected symptoms and returns a ranked list of likely diseases/conditions.
*   **Algorithm**: Random Forest Classifier (200 estimators).
*   **Dataset**: `disease_symptom_train.csv` (4,920 rows, 41 balanced disease classes).
*   **Accuracy**: 100% (1.0 Accuracy & Macro F1).
*   **Crucial Insight / Limitation to explain (VERY IMPORTANT)**: A 100% score is actually a **warning sign**. The dataset gives every disease a perfectly distinct, non-overlapping set of symptoms with zero noise. The model just memorized a lookup table. Real patients have overlapping and confusing symptoms. You should explicitly tell your examiner: *"The 100% accuracy shows the dataset is perfectly separable, not that the model has solved real-world clinical diagnosis."*

### C. ECG Beat Anomaly Detector
*   **Purpose**: A screening tool that looks at a single ECG heartbeat and flags if its morphology (shape) is abnormal (e.g., a ventricular beat).
*   **Algorithm**: Supervised 1D-CNN (Convolutional Neural Network) Ensemble.
*   **Dataset**: PhysioNet MIT-BIH Arrhythmia Database. Trained on 22 patients (DS1), tested on 22 *different* unseen patients (DS2).
*   **Metrics on Unseen Patients (DS2)**:
    *   **ROC-AUC**: 0.818
    *   **Specificity**: 99.1% (Leaves normal beats unflagged, only 0.9% false alarms).
    *   **Ventricular beats caught (True Positives)**: 62%
    *   **Supraventricular beats caught**: 1% (because it only looks at one beat at a time, it can't see "timing/rhythm" which is needed to catch these).
*   **Crucial Insight**: It is an honest inter-patient benchmark. It does not classify *which* arrhythmia the patient has, it just flags "abnormal" for a doctor to review.

### D. CBC (Complete Blood Count) Analyzer
*   **Purpose**: Analyzes 20 blood parameters (WBC, RBC, Hemoglobin, etc.) to group blood test results into patterns (Normal, Mild Concern, Abnormal).
*   **Algorithm**: Unsupervised Learning using **Isolation Forest + KMeans** clustering (k=3).
*   **Dataset**: `cbc information.xlsx` (416 samples).
*   **Accuracy**: *N/A*. Because it is an unsupervised clustering model, there are no "ground truth" labels to measure traditional accuracy against. It groups data based on severity.

### E. Bayesian Risk Engine
*   **Purpose**: Models the probabilistic relationship between demographics, risk factors (like Hypertension, High Cholesterol), and outcomes (Coronary Disease, Chest Pain).
*   **Algorithm**: Bayesian Network (7-node DAG using `pgmpy`).
*   **Dataset**: Fit on the same 1,025-row cardiac dataset.
*   **Crucial Insight**: It doesn't just guess; every conditional probability is learned directly from the data.

---

## 3. The "AI Doctor" (Voice Assistant Workflow)
The voice assistant (Dr. Arjun) is a core feature. It is built for safety and reliability, not just passing a prompt to an LLM.

**How it works (The Flow):**
1.  **Voice Input**: The patient speaks (via Vapi Web SDK) in Hindi/Hinglish. Speech-to-text is handled by Deepgram.
2.  **RAG (Retrieval-Augmented Generation)**: The backend doesn't just rely on the LLM's memory. It retrieves medical knowledge using TF-IDF (Text matching) from a curated base of 53 documents (herbs, lifestyle, red-flags). This info is injected into the LLM's prompt.
3.  **LLM Processing**: Groq (a fast LLM inference engine) processes the transcript and generates a response.
4.  **Voice Output**: Azure Neural TTS converts the text back to Hindi voice.
5.  **Post-Call Report Generation**: Once the call ends, a structured JSON report is generated.

**The Deterministic Safety Layer (Crucial for your presentation):**
LLMs hallucinate, so this project does NOT trust the LLM fully. After the LLM generates a report, the backend runs 3 hard-coded (deterministic) checks:
*   **Herb Contraindications**: If the LLM suggests Licorice, but the patient's database record says they have Hypertension, the system catches it and flags it.
*   **Emergency Scanning**: The system scans the raw transcript for emergency red flags (e.g., chest pain), independent of what the LLM thought.
*   **Websocket Alerts**: If an URGENT case is detected, a live alert is pushed via WebSockets to the doctor's dashboard immediately.

---

## 4. Architecture & Implementation (Frontend/Backend)

### Tech Stack
*   **Frontend**: React 18, Vite, TypeScript, Zustand (for state management), Tailwind CSS (styling).
*   **Backend**: Node.js 20, Express, TypeScript, Prisma (ORM for database), Socket.IO (for live alerts).
*   **ML Service**: Python 3.11, FastAPI, Scikit-learn, PyTorch, XGBoost.
*   **Database**: PostgreSQL (relational data) and Redis (for rate limiting, locking, and AI call budgets).

### Separation of Concerns (Security)
*   **The ML Service is completely hidden from the internet.** Only the Node.js backend can talk to the Python ML service using a secret internal key (`X-Internal-Service-Key`).
*   **Role-Based Access Control (RBAC)**: One central middleware handles all security. If a patient tries to access another patient's report, they are blocked at the middleware level.

---

## 5. Summary for Viva/Presentation
If asked to summarize the project, highlight these 3 points:
1.  **Real, Honest ML Metrics**: We didn't just chase 99% accuracy. We acknowledge dataset limitations (like the Symptom Checker's perfect score) and use strict inter-patient testing for the ECG model.
2.  **Safety First AI**: The AI voice assistant is backed by deterministic, hard-coded safety layers (herb cross-checking, emergency scanning) because LLMs alone are not clinically safe.
3.  **Full Hospital Workflow**: It's not just a chatbox. It has 5 separate roles (Patient, Doctor, Receptionist, Lab, Admin) with secure access control, PDF report generation, and real-time alerts.
