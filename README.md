<div align="center">

# 🗺️ CareerPath Map

**An AI-powered Career Roadmap Generator — from role to job-ready, in seconds.**

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6db33f?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Groq](https://img.shields.io/badge/Groq-LLM-f59e0b?style=flat-square&logo=lightning&logoColor=black)](https://groq.com)
[![Java](https://img.shields.io/badge/Java-17-f89820?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

> Type any engineering role → Get a full AI-generated skill roadmap, technology choices, and a detailed syllabus for every skill — all in one place.

</div>

---

## ✨ What is CareerPath Map?

CareerPath Map helps developers, students, and career-switchers answer the question: **"What exactly do I need to learn to become a [Role]?"**

Instead of endlessly googling, the app generates a **structured, visual skill tree** powered by Groq's ultra-fast LLM. Each node in the tree is a skill — click it and a rich, detailed syllabus appears instantly below the chart with topics, subtopics, hands-on projects, and curated resources.

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| 🎯 **Role-Based Search** | Type any role — Backend Dev, ML Engineer, DevOps, Cloud Architect, etc. |
| 🤖 **AI-Generated Roadmaps** | Groq LLM generates structured skill trees tailored to your role |
| 🔀 **Tech Stack Choices** | Multiple paths (e.g. Java vs Python vs Node.js) with difficulty ratings |
| 📊 **Visual Flowchart** | Clean, static level-based tree with animated SVG connectors |
| 📖 **Inline Syllabus Reveal** | Click any node → full syllabus loads below with 2-column layout |
| ✅ **Progress Tracking** | Mark skills complete — persisted in `localStorage` across sessions |
| ⚡ **Smart Fallback** | Automatic fallback data if Groq API rate-limits, ensuring zero downtime |
| 🎨 **Cyber Black & Amber UI** | Premium dark theme with Space Grotesk, Inter & JetBrains Mono fonts |

---

## 🏗️ Architecture

```
CareerPath Map
│
├── frontend/           # React + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx      # Hero + role search
│   │   │   ├── Dashboard.jsx        # Main layout after search
│   │   │   ├── ChoicesGrid.jsx      # Tech stack choice cards
│   │   │   └── FlowchartView.jsx    # Skill tree + syllabus panel
│   │   └── api/
│   │       └── roadmapApi.js        # Axios API calls to backend
│   └── index.html
│
└── backend/            # Spring Boot 3.2 (Java 17)
    └── src/main/java/com/careerpathmap/
        ├── controller/
        │   ├── RoadmapController.java   # REST endpoints
        │   └── HomeController.java      # Root health page
        └── service/
            ├── GroqService.java         # Groq LLM integration
            └── FallbackService.java     # Offline-safe fallback data
```

---

## 🛠️ Tech Stack

**Frontend**
- **React 18** + **Vite 5** — component-based SPA with lightning-fast HMR
- **Tailwind CSS v4** — utility-first styling
- **Lucide React** — consistent iconography
- Custom **SVG flowchart** engine — no heavy canvas library dependencies

**Backend**
- **Spring Boot 3.2** (Java 17) — REST API server on port `8080`
- **RestTemplate** — HTTP client for Groq API calls
- **FallbackService** — pre-built JSON responses when API is rate-limited

**AI / LLM**
- **Groq API** — ultra-low-latency LLM inference
- Model: `llama-3.1-8b-instant` (fast & within free-tier limits)
- Auto-retry on `429 Too Many Requests` with exponential backoff

---

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ 18
- Java 17
- Maven 3.9+
- A free [Groq API Key](https://console.groq.com)

### 1. Clone the repository

```bash
git clone https://github.com/Mathivadhana04/CareerPath_Map.git
cd CareerPath_Map
```

### 2. Configure the Groq API Key

Open `backend/src/main/resources/application.properties` and replace the placeholder:

```properties
groq.api.key=${GROQ_API_KEY:your-groq-api-key-here}
```

Or export it as an environment variable:

```bash
# Windows CMD
set GROQ_API_KEY=your-groq-api-key-here

# macOS / Linux / Git Bash
export GROQ_API_KEY=your-groq-api-key-here
```

### 3. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

> Backend starts on → `http://localhost:8080`

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

> Frontend starts on → `http://localhost:5173`

### 5. Open the app

```
http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Health check |
| `GET`  | `/api/choices?role=Backend+Developer` | Get tech stack choices for a role |
| `POST` | `/api/roadmap` | Generate skill tree `{ "role": "...", "choice": "..." }` |
| `POST` | `/api/syllabus` | Get skill syllabus `{ "role": "...", "choice": "...", "skill": "..." }` |

---

## 🖥️ Screenshots

> **Landing Page** — role search with AI-powered badge and quick-select chips

> **Dashboard** — tech stack choices with difficulty ratings and skill counts

> **Flowchart** — static level-based skill tree with amber SVG connectors

> **Syllabus Panel** — two-column reveal below the chart with topics, projects and resources

---



<div align="center">

Built with ☕ Java, ⚛️ React & ⚡ Groq LLM

**[Mathivadhana04](https://github.com/Mathivadhana04)** · [CareerPath_Map](https://github.com/Mathivadhana04/CareerPath_Map)

</div>
