# 🎯 Boardroom

**A real-time multi-agent simulation where 5 AI personas debate your startup idea and deliver a final verdict.**

Boardroom lets you validate your startup ideas by getting feedback from 5 AI-powered personas — each with a unique perspective (VC, Angel Investor, Customer, Marketer, Risk Analyst).

---

## 🛠️ Tech Stack & Implementation

This project is built with a modern AI stack designed for real-time interaction:

- **Next.js 16** (App Router) — Frontend & API routes
- **Tailwind CSS 4** — Styling (Neo-Brutalism design system)
- **LangGraph** — Multi-agent orchestration and state management
- **Groq API** — Ultra-fast inference using **Llama 3.3 70B**
- **Vercel AI SDK** — Streaming responses to the UI

---

## 🏗️ Architecture: Centralized Orchestration

We use a **Supervisor (Chairman)** agent to manage the flow of conversation between 5 distinct **Subagents (Personas)**. This pattern ensures the debate stays focused and productive.

![Agent Architecture](/public/agent-architecture.png)

*   **User Request:** The initial startup idea starts a new thread.
*   **Main Agent (Chairman):** A dedicated Llama 3.3 instance that decides who speaks next based on the conversation context. It manages the turn-taking and ensures all perspectives are heard.
*   **Subagents:** Specialist personas (VC, Risk, etc.) who provide expert input when called by the Chairman.
*   **Final Verdict:** The Chairman triggers a special "Verdict Node" to synthesize the discussion into a final authoritative decision.

---

## 📸 Screenshots

### The Council Chamber — Multi-Agent Debate
![Council Chamber](/public/council-chamber.png)

### Dashboard — Pick Your Validators
![Dashboard](/public/screenshot-dashboard.png)

### Results — AI Analysis
![Results](/public/screenshot-results.png)

---

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Set up your API key
cp .env.example .env.local
# Add your GROQ_API_KEY to .env.local

# Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with:
- **Email**: `demo@example.com`
- **Password**: `password123`


