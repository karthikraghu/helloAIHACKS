# 🎯 Boardroom

**Pitch your startup idea to a panel of AI experts and get instant feedback.**

Boardroom lets you validate your startup ideas by getting feedback from 5 AI-powered personas — each with a unique perspective (VC, Angel Investor, Customer, Marketer, Risk Analyst).

---

## 📸 Screenshots

### Login Page
![Login Page](/public/screenshot-login.png)

### Dashboard — Pick Your Validators
![Dashboard](/public/screenshot-dashboard.png)

### Results — AI Analysis
![Results](/public/screenshot-results.png)

### The Council Chamber — Multi-Agent Debate
![Council Chamber](/public/council-chamber.png)

---

## 🏗️ Architecture: Centralized Orchestration

We use a **Supervisor (Chairman)** agent to manage the flow of conversation between 5 distinct **Subagents (Personas)**. This pattern ensures the debate stays focused and productive.

![Agent Architecture](/public/agent-architecture.png)

*   **User Request:** The initial startup idea.
*   **Main Agent (Chairman):** Decides who speaks next based on the conversation context.
*   **Subagents:** Specialist personas (VC, Risk, etc.) who provide expert input when called.
*   **Final Response:** The Chairman triggers a "Verdict Node" to synthesize the discussion into a final decision.

---

## 🚀 How It Works

1. **Login** — Sign in with demo credentials (no real auth required)
2. **Pick Experts** — Choose which personas you want feedback from
3. **Describe Your Idea** — Type your startup idea in the text box
4. **Get Feedback** — Each expert analyzes your idea and gives:
   - A detailed analysis
   - 3 scores (1-10)
   - A **GO** or **NO GO** verdict

---

## 🧑‍💼 The 5 Expert Personas

| Name | Role | What They Evaluate |
|------|------|-------------------|
| **Gus** | VC Partner | Market size, scalability, investment potential |
| **Walter** | Angel Investor | Innovation, founder-market fit, empire potential |
| **Jesse** | First Customer | Would they actually buy it? Pain points, pricing |
| **Saul** | Growth Marketer | Go-to-market strategy, viral potential |
| **Mike** | Risk Officer | Legal risks, competitive threats, blind spots |

---

## 🛠️ Tech Stack

- **Next.js 16** — React framework
- **Tailwind CSS 4** — Styling (Neo-Brutalism design)
- **Groq API** — Llama 3.3 70B for AI responses
- **TypeScript** — Type safety

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

---

## 📄 License

Built for hackathon demo purposes.
