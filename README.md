# Privacy-Preserving Scheduling Chatbot

A privacy-first scheduling chatbot that understands natural language scheduling requests and suggests suitable meeting rooms without storing any user data.

---

## Features

- Natural language constraint extraction
- Constraint-based room matching
- Heuristic fallback for closest matches
- Explainable room recommendations
- Zero user data persistence
- Stateless backend architecture
- Automated evaluation script

---

## Tech Stack

### Frontend
- React.js
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Compromise.js

### Database
- PostgreSQL
- TypeORM  
> Used only for synthetic room data

---

## Privacy Model

- User input is never stored in a database
- No personal identifiers are collected
- No cookies or tracking mechanisms
- Data exists only in memory during request lifecycle
- Browser refresh or tab close clears all session data

---

## Project Structure

```text
frontend/
backend/
 ├── nlp/
 ├── matching/
 ├── entities/
 ├── routes/
tests/
```
## How It Works
NLP Parsing

Input

I need a room for 6 people with a projector at 14:00

## Output

{
  "capacity": 6,
  "time": "14:00",
  "requirements": ["projector"]
}

### Room Matching Logic

#### Exact Match
- Capacity meets the requirement
- Required features are available
- Exact time slot is available

#### Closest Match (Heuristic)
- Slightly larger room
- Nearest available time
- Minimal feature compromise

Each response includes an explanation describing why the room was selected.
##API Endpoints
```text POST /parse```

Parses natural language input into structured constraints.

```text POST /match ```

Returns the best matching room with reasoning.

##Automated Testing

- Sends 100 randomized scheduling requests

- Measures NLP extraction accuracy

- Tracks exact vs heuristic matches

##Sample Output
```
{
  "totalTests": 100,
  "exactMatches": 62,
  "heuristicMatches": 30,
  "failures": 8
}
```
###Getting Started
```Clone Repository
git clone https://github.com/your-username/privacy-scheduling-chatbot.git
cd privacy-scheduling-chatbot
```

##Backend Setup
```cd backend
npm install
npm run dev
```
##Frontend Setup
```cd frontend
npm install
npm start
```
##Environment Variables
```DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=chatbot_rooms
```
##Out of Scope

- Authentication

- User accounts

- Chat history

- Analytics

- Persistent user data storage


##Author

Muhammad Shahrooz Altaf
