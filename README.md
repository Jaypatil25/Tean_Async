# Credify — Intelligent Credit Risk Engine

> “Banks don’t lack data — they lack intelligence to connect it before lending decisions are made.”

---

## Overview

Credify is a credit intelligence platform designed to improve corporate lending decisions using real-time validation, AI-based analysis, and relationship mapping.

It detects inconsistencies, hidden risks, and fraud signals at the earliest stage of application, reducing reliance on manual credit appraisal and improving decision accuracy.

---

## Core Features

### 1. Real-Time Financial Validation
- Validates user inputs while filling the application
- Compares entered data with:
  - Bank statements
  - GST data
  - Financial records
- Inline feedback:
  - Green → match
  - Amber → slight mismatch
  - Red → strong contradiction
- Provides confidence score and explanation
- Non-blocking, soft warning UX

---

### 2. Company Ownership & Risk Graph
- Builds a relationship graph of:
  - Companies
  - Directors
  - Shareholders
- Detects:
  - Shell company patterns
  - Circular ownership
  - Director overlaps
  - Address reuse
- Outputs risk flags and score

---

### 3. Credit Appraisal Memo Generation
- Generates structured output:
  - Risk score
  - Key issues
  - Observations
  - Recommendation
- Fully explainable logic

---

### 4. AI-Based Analysis Engine
- Financial anomaly detection
- Statistical comparison
- Graph-based risk evaluation
- Modular design for future ML integration

---

## Architecture

Frontend (React)
    ↓
Backend API (Node.js / Express)
    ↓
AI Engine (Python / FastAPI)
    ↓
Validation + Graph + Scoring
    ↓
Response (Risk + Memo)

---

## Tech Stack

Frontend:
- React (Vite)
- Custom hooks
- Fetch API

Backend:
- Node.js
- Express
- Axios

AI Engine:
- Python (FastAPI)
- NumPy, Pandas
- NetworkX

---

## Project Structure


creditmind-ai/
├── frontend/
├── backend/
├── ai-engine/
├── data/
├── docs/


---

## Setup Instructions

### Clone Repository

git clone https://github.com/your-username/credify.git

cd credify


### Frontend

cd frontend
npm install
npm run dev


### Backend

cd backend
npm install
node server.js


### AI Engine

cd ai-engine
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000


---

## API Endpoints

### Validate Field

POST /api/validate-field


### Full Analysis

POST /api/analyze


### Company Risk

POST /api/company-risk


---

## Problem Statement

- Credit evaluation is manual and inconsistent  
- Critical risk signals are often missed  
- Decision-making depends heavily on individual judgment  
- Processing time is high  
- Fraud detection happens too late  

---

## Solution

Credify introduces:
- Real-time validation during data entry  
- AI-driven analysis across multiple data sources  
- Graph-based relationship intelligence  
- Explainable and consistent outputs  

---

## Impact

- Faster credit decisions  
- Reduced risk exposure  
- Improved consistency  
- Better detection of hidden fraud patterns  

---

## Future Scope

- Integration with MCA and GST data sources  
- LLM-based reasoning layer  
- Advanced fraud detection models  
- Banking system integrations  

---


## Note

This project is designed as a scalable foundation for intelligent credit systems and can be extended into a production-grade fintech platform.
