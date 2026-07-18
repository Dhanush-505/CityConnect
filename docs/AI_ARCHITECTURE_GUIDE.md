# CityConnect AI Engine & Smart City Intelligence Architecture

## 1. Overview
Part 11 introduces an intelligent, zero-dependency AI engine into CityConnect that runs seamlessly on local Node.js environments while providing plug-and-play architecture for external Large Language Model (LLM) APIs (such as Google Gemini, OpenAI, or Hugging Face).

---

## 2. Core AI Sub-Modules & Algorithms

### A. Automatic Complaint Classification & Department Routing
- **Input**: Complaint title & description.
- **Algorithm**: Multi-class keyword frequency scoring + N-gram matching across municipal department taxonomies (Electricity, Water Supply, Drainage & Waste Management).
- **Output**: Department, Category, Confidence % score, and Emergency hazard trigger flag.

### B. Priority Prediction & Sentiment Analysis
- **Input**: Text corpus + emergency flags.
- **Output**:
  - Priority Level: `Low`, `Medium`, `High`, `Critical`.
  - Citizen Sentiment: `Calm`, `Concerned`, `Urgent`, `Critical`.

### C. Duplicate Complaint Detection
- **Algorithm**: Spatial Proximity (Haversine formula within 500m radius) combined with Jaccard/TF-IDF text similarity thresholding (>40% overlap).
- **Action**: Prompts citizens during complaint submission to upvote/support existing geotagged complaints.

### D. AI Smart Worker Recommendation
- **Inputs**: Grievance department, complaint latitude/longitude, field worker workload DB, worker department.
- **Algorithm**: Multi-variable weighted scoring:
  - Department match weight: 20%
  - Spatial proximity distance weight: 40%
  - Active task queue weight: 30%
  - Average resolution speed weight: 10%

### E. Role-Aware AI Assistant (Chatbot)
- **Citizens**: Assistance with filing grievances, status tracking, helpline numbers.
- **Municipal Admins**: Real-time KPI summaries, worker workload balancing recommendations.
- **Field Workers**: Task queue guidance and navigation support.

---

## 3. External LLM API Integration (Gemini / OpenAI)
To connect Google Gemini API or OpenAI GPT:
1. Set API Key in `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```
2. Update `backend/controllers/aiController.js` to replace internal fallback classifier with Gemini API calls:
   ```javascript
   import { GoogleGenerativeAI } from '@google/generative-ai';
   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
   ```

---

## 4. Anonymized Machine Learning Dataset Export
Export anonymized training datasets via `GET /api/ai/dataset` for custom offline model training in Python (Scikit-Learn, PyTorch, TensorFlow).
