# Privacy-Preserving Scheduling Chatbot

A full-stack intelligent booking system that allows users to find and book meeting rooms using natural language. The system features a custom NLP engine to extract constraints and a heuristic synthesis matcher to provide smart alternatives when an exact match isn't available.

## 🚀 Key Features

- **Natural Language Processing**: Built with `compromise` to extract capacity (supporting words like "ten" or digits "10"), time, and specific room features from user prompts.
- **Heuristic Search & Synthesis**: If a perfect match isn't found, the bot synthesizes options—suggesting the closest available time or a room with a slightly different capacity.
- **Database Integration**: Robust ORM management using `TypeORM` and `PostgreSQL`.
- **Privacy-First**: Designed to handle scheduling constraints without requiring intrusive user data.
- **Modern Tech Stack**: React 19 Frontend with a Node.js/TypeScript Express Backend.

---

## 🛠 Tech Stack

### Frontend

- **React 19**: Modern UI development.
- **Vite**: Ultra-fast build tool and dev server.
- **Tailwind CSS**: Utility-first styling.
- **TypeScript**: Static typing for reliable frontend state.

### Backend

- **Express 5**: Latest version of the standard Node.js framework.
- **TypeORM**: Data mapping and PostgreSQL interaction.
- **Compromise NLP**: Lightweight natural language processing for constraint extraction.
- **ts-node & Nodemon**: Seamless TypeScript development environment.

---

## 📦 Installation & Setup

### Prerequisites

- Node.js (v18+)
- pnpm (recommended) or npm/yarn
- PostgreSQL database instance

### 1. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables (create a .env file):

   ```text
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=your_user
    DB_PASS=your_password
    DB_NAME=scheduling_db
   ```

4. Seed the database with rooms:

   ```bash
   pnpm run seed
   ```

5. Start development server:

   ```bash
   pnpm run dev
   ```

### 2. Frontend Setup

1. Navigate to the frontend folder:

   ```Bash
   cd frontend2
   ```

2. Install dependencies:

   ```Bash
   pnpm install
   ```

3. Start the Vite dev server:

   ```Bash
   pnpm run dev
   ```

### 🧠 Logic Spotlight: Smart Alternatives

The bot uses a Heuristic Synthesis Engine. When you ask for a "Room for 10 at 5pm with WiFi" and that room is booked, the system doesn't just say "No." It analyzes available data to offer:

    - Time-Shifted Option: "Room E is available at 3:00 PM."

    - Capacity-Shifted Option: "Room A is available at 5:00 PM but only fits 4 people."

### 📜 Scripts

| Service      | Command          | Description                                |
| :----------- | :--------------- | :----------------------------------------- |
| **Backend**  | `pnpm run dev`   | Starts nodemon with ts-node.               |
| **Backend**  | `pnpm run seed`  | Populates database with initial room data. |
| **Backend**  | `pnpm run build` | Compiles TypeScript to JS.                 |
| **Frontend** | `pnpm run dev`   | Starts Vite development server.            |
| **Frontend** | `pnpm run build` | Builds the React app for production.       |

### 📄 License

This project is licensed under the ISC License.
