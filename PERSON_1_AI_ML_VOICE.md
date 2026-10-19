# Person 1: AI, Machine Learning & Voice Assistant Lead
**Owner**: Team Member 1  
**Project**: MediSense AI  
**Scope**: Python ML Microservice, Dr. Arjun Voice Assistant, Machine Learning Models, and Clinical Safety Guardrails.

---

## 1. Role Overview & Responsibilities
You are responsible for the **intelligence layer** of MediSense AI. Your system runs as a standalone Python FastAPI microservice that communicates exclusively with the Node.js backend. You do not touch database queries or frontend components directly.

### Your Key Areas:
1. **The 5 Trained ML Models**: Heart Risk, Symptom Checker, ECG Anomaly Classifier, CBC Blood Clusterer, and Bayesian Network.
2. **The 2 Rule-based Clinical Engines**: Lipid Profile Analyzer and Fuzzy Drug Dosing Controller.
3. **Dr. Arjun Voice Assistant & RAG**: Real-time voice interaction pipeline, transcript processing, medical knowledge retrieval, and clinical report generation.
4. **Safety & Ethics Guardrails**: Deterministic herb contraindication screening, emergency keyword detection, and honest metric reporting.

---

## 2. Directory & Files You Own
Everything inside the `ml-service/` directory belongs to you:

```
ml-service/
├── app/
│   ├── main.py                     # FastAPI entry point & lifespan model loader
│   ├── core/                       # App settings, environment & security middleware
│   ├── api/routes/
│   │   ├── medisense_predict.py    # Heart Disease Risk + Symptom Checker endpoints
│   │   ├── cbc_analyze.py          # CBC Blood Anomaly Detection
│   │   ├── lipid_analyze.py        # Rule-based ACC/AHA Lipid Analyzer
│   │   ├── bayesian_engine.py      # Bayesian Decision & Uncertainty Engine
│   │   ├── fuzzy_dosing.py         # Mamdani Fuzzy Logic Drug Dosing
│   │   ├── deep_anomaly.py         # 1D-CNN ECG Beat Classifier
│   │   ├── rag_retrieve.py         # TF-IDF RAG Knowledge Base Retrieval
│   │   └── pdf_extract.py          # PDF/OCR parsing for uploaded medical lab reports
│   ├── ml/
│   │   ├── ecg_classifier.py       # PyTorch 1D-CNN model architecture
│   │   └── ecg_autoencoder.py      # Reconstruction autoencoder architecture
│   ├── models/                     # Pickled models, scalers, weights & metadata JSONs
│   └── rag/
│       ├── retriever.py            # TF-IDF lexical retrieval engine
│       └── documents/              # 53 curated JSON medical reference documents
├── data/                           # Training CSVs (Heart disease, symptoms, lipids, CBC)
├── train/                          # Offline training scripts
├── requirements.txt                # Python dependencies
└── models_manifest.json            # Exact model hashes and verified metrics
```

---

## 3. Immediate Action Items (Bug Fixes & Cleanup)

### Task 1: Delete Irrelevant Hypothesis / "Big Data" Code
- [ ] **Delete file**: `ml-service/app/api/routes/hypothesis.py` (This file performed redundant Chi-square/T-tests on a static 1,025-row CSV and mislabeled it as "Big Data").
- [ ] **Clean up `ml-service/app/main.py`**:
  - Remove line 32 import: `hypothesis` from `app.api.routes`.
  - Remove line 160: `app.include_router(hypothesis.router, ...)`
  - Remove line 14: docstring reference to `Population Hypothesis Tests`.

### Task 2: Verify `models_manifest.json` Integrity
- [ ] Ensure that `models_manifest.json` matches the actual trained weights in `ml-service/app/models/`.
- [ ] Ensure the `/api/health` endpoint loads smoothly and reports `models_ready: true`.

---

## 4. Deep Technical Knowledge (How Your Code Works)

### A. The 5 Machine Learning Models

| Model | Algorithm | Dataset | Honest Metric | Key Defense Point for Viva |
| :--- | :--- | :--- | :--- | :--- |
| **Heart Disease Risk** | XGBoost Classifier | 1,025 cardiac records | **95.5% Acc, 0.995 AUC** | *Feature scaler was fit strictly inside the training split to eliminate data leakage. Dataset is clean public benchmark.* |
| **Symptom Checker** | Random Forest (200 trees) | 4,920 records (41 diseases) | **100% Acc** | *100% is a dataset artifact: symptoms in the training set are perfectly non-overlapping. In real life, symptoms overlap.* |
| **ECG Beat Screening** | Supervised 1D-CNN Ensemble | PhysioNet MIT-BIH Arrhythmia | **0.818 AUC, 99.1% Spec** | *Evaluated on DS2 (22 unseen patients). Catches 62% ventricular beats. Supraventricular beats need multi-beat timing.* |
| **CBC Blood Analyzer** | Isolation Forest + KMeans ($k=3$) | 416 CBC blood samples | **Unsupervised** | *No ground-truth labels exist; groups blood values into Normal, Mild, and Severe anomaly clusters.* |
| **Bayesian Risk Engine** | Bayesian DAG (`pgmpy`) | 1,025 cardiac records | **Exact Inference** | *Learns conditional dependencies between age, BP, cholesterol, and outcomes; computes epistemic uncertainty.* |

### B. Dr. Arjun Voice Assistant & RAG Pipeline
1. **WebRTC Voice Stream**: Patient speaks into browser $\to$ Vapi Web SDK streams audio $\to$ Deepgram STT transcribes Hindi/Hinglish text.
2. **Lexical RAG Retrieval (`rag_retrieve.py`)**:
   - Queries a curated database of 53 medical reference files (herbs, dosage, contraindications, red-flag symptoms).
   - Uses **TF-IDF keyword matching** instead of dense vector embeddings because TF-IDF uses 30MB RAM vs 500MB+ for PyTorch embedding models, preventing Out-Of-Memory (OOM) crashes on deployment.
3. **LLM Generation**: Groq (Llama-3-70B) generates doctor dialogue and clinical consultation summaries.
4. **Deterministic Safety Layer**:
   - **Herb Contraindication Check**: Even if the LLM suggests an herb (e.g., Licorice), Python cross-checks it against patient conditions (Hypertension $\to$ Licorice increases BP $\to$ BLOCKED).
   - **Emergency Detection**: Scans transcript for life-threatening keywords (chest pain, stroke, breathing difficulty) and triggers immediate alerts.

---

## 5. How to Run & Test Your Service

```bash
# 1. Navigate to ML service directory
cd ml-service

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the ML microservice
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Swagger Documentation**: Open `http://localhost:8000/api/docs` in your browser.
- **Health check**: `http://localhost:8000/api/health`

---

## 6. Viva / Presentation Q&A Cheat Sheet

> **Q1: Why did your Symptom Checker get 100% accuracy? Is it overfitted?**  
> **Your Answer**: *"100% accuracy on held-out data indicates that the dataset is linearly separable with zero noise. Each of the 41 diseases in the dataset has a unique, non-overlapping symptom combination. The model essentially learned a decision table. While mathematically 100%, in a clinical setting real patients present overlapping and vague symptoms, so we transparently document this as a limitation."*

> **Q2: Why did you use 1D-CNN for ECG instead of an Autoencoder?**  
> **Your Answer**: *"An earlier version used an unsupervised reconstruction autoencoder trained on normal beats, but its recall on unseen patients was only 25.5%. We replaced it with a supervised 1D-CNN ensemble evaluated on the standard MIT-BIH DS1/DS2 inter-patient split (De Chazal et al.), achieving 81.8% ROC-AUC and 99.1% specificity on 22 unseen patients."*

> **Q3: Why TF-IDF for RAG instead of Vector Embeddings (ChromaDB / Pinecone)?**  
> **Your Answer**: *"Our medical reference corpus is tightly curated (53 domain-specific documents covering Ayurvedic remedies and triage rules). In a small, specialized vocabulary, keyword and n-gram overlap provides high precision. Using dense transformer embeddings would require loading massive PyTorch models into RAM alongside our CNN and XGBoost, causing memory bottlenecks on production servers."*
