# MERN Stack Task Manager Application

A comprehensive task management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- Admin and Agent user authentication with JWT
- Task creation and assignment
- Task status tracking and updates
- Agent performance monitoring
- Excel/CSV file task import
- Email notifications for task assignments
- Responsive mobile-friendly interface

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000

   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:5173`.

## Usage

1. **Login**
   - Use the admin credentials to log in
   - The system uses JWT for authentication

2. **Agent Management**
   - Add, edit, or delete agents
   - View agent details and assigned tasks

3. **Task Distribution**
   - Upload CSV files containing task lists
   - Tasks are automatically distributed among agents
   - Monitor task completion progress


## File Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## API Endpoints

### Authentication
- POST /api/auth/register/admin - Register new admin
- POST /api/auth/register/agent - Register new agent (admin only) 
- POST /api/auth/login - Login for both admin and agent

### Tasks
- GET /api/tasks - Get all tasks
- GET /api/tasks/stats - Get task statistics
- POST /api/tasks/upload - Import and distribute tasks from CSV/Excel
- DELETE /api/tasks/clear - Clear all tasks
- GET /api/tasks/agent/:agentId - Get tasks for specific agent
- PATCH /api/tasks/task/:taskId/complete - Mark task as completed

### Agents
- GET /api/agents - Get all agents for current admin
- POST /api/agents - Create new agent
- PUT /api/agents/:id - Update agent details
- DELETE /api/agents/:id - Delete agent

### Performance
- GET /api/performance/:agentId - Get agent performance metrics
- GET /api/performance/stats - Get overall system statistics

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

