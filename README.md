🛡️ Privacy-Preserving Scheduling Chatbot

A privacy-first, zero-persistence scheduling chatbot that understands natural language requests and intelligently suggests meeting rooms without storing any user data.

This project demonstrates NLP processing, constraint satisfaction algorithms, and privacy-by-design architecture using modern JavaScript tooling.

✨ Key Features

🔒 Zero User Data Persistence

🧠 Natural Language Understanding using compromise

🏢 Smart Room Matching with heuristic fallback

📖 Explainable AI Responses

🧪 Automated Evaluation Harness

⚡ Clean, modular architecture

🧱 Tech Stack
Frontend

React.js

Tailwind CSS

Session-only state management (no localStorage)

Backend

Node.js

Express.js

Compromise.js (NLP)

Database

PostgreSQL

TypeORM

⚠️ Used only for synthetic room data
(no user data is ever stored)

Tooling

Git

Node.js ≥ 18

🔐 Privacy-First Design

This application is built with privacy as a core requirement, not an afterthought.

What We Do

❌ Do not store user messages

❌ Do not store names, emails, or identifiers

❌ Do not log user queries

❌ Do not use cookies or tracking

How It Works

User input lives only:

in browser memory (frontend)

during request lifecycle (backend)

Refreshing the page or closing the tab wipes all data

Backend remains stateless

This design supports GDPR-style data minimization principles.

🧩 Architecture Overview
frontend/        → React chat interface
backend/         → Express API
 ├── nlp/        → NLP constraint extraction
 ├── matching/   → Constraint satisfaction logic
 ├── entities/   → TypeORM room entities
 ├── routes/     → API endpoints
tests/           → Automated evaluation scripts

🧠 Functional Modules
1️⃣ NLP Engine (The “Ear”)

Extracts structured constraints from natural language.

Example Input

"I need a room for 6 people with a projector at 14:00"


Output

{
  "capacity": 6,
  "time": "14:00",
  "requirements": ["projector"]
}


Built using Compromise.js with normalization and fallback handling.

2️⃣ Constraint Satisfaction Engine (The “Brain”)

Matches user constraints against synthetic room data.

Matching Strategy

Exact Match

Capacity ≥ requested

All requested features available

Exact time slot

Closest Match (Heuristic)

Slightly larger room

Nearest available time (±10–30 mins)

Minimal feature compromise

Explainable Response

Every recommendation includes a clear reason:

“This room matches your capacity and has a projector. The closest available slot is 10 minutes later.”

3️⃣ Privacy & Security Layer (The “Vault”)

No persistent storage of user input

Stateless backend

Automatic data wipe on refresh or tab close

🔌 API Endpoints
POST /parse

Parses natural language input into structured constraints.

POST /match

Returns the best room match with an explanation.

🧪 Automated Evaluation

An automated test harness is included to validate system behavior.

What It Does

Sends 100 randomized user requests

Tests:

NLP extraction accuracy

Matching success rate

Heuristic fallback usage

Sample Metrics Output
{
  "totalTests": 100,
  "exactMatches": 62,
  "heuristicMatches": 30,
  "failures": 8
}

🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/your-username/privacy-scheduling-chatbot.git
cd privacy-scheduling-chatbot

2️⃣ Backend Setup
cd backend
npm install
npm run dev


Configure PostgreSQL connection in .env.

3️⃣ Frontend Setup
cd frontend
npm install
npm start

📌 Environment Variables (Backend)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=chatbot_rooms

🚫 Out of Scope (By Design)

Authentication

User profiles

Message history

Analytics or tracking

Cloud persistence

🎯 Use Cases

Academic NLP projects

Privacy-focused AI demos

Scheduling assistants

Constraint-based recommendation systems

📄 License

MIT License

👤 Author

Muhammad Shahrooz Altaf
Full-Stack Developer | Privacy-Focused Systems
