# WebSocket-Powered Kanban Board Backend

This is the backend server for a real-time Kanban board application, built with Node.js, Express, and Socket.IO. It provides WebSocket communication for real-time task management across multiple clients.

## 📋 Features

- **WebSocket Server**: Real-time bidirectional communication
- **Task Management**: Create, update, delete, and move tasks
- **In-memory Storage**: Simple data persistence for tasks
- **CORS Support**: Configured for cross-origin requests

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd websocket-kanban-vitest-playwright/backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. The server will be running at [http://localhost:5000](http://localhost:5000)

## 🏗️ Project Structure

```
backend/
│
├── server.js                # Main server file with WebSocket logic
├── package.json             # Project dependencies and scripts
└── README.md                # This file
```

## 📡 WebSocket Events

The server listens for these events from clients:

- `task:create`: Creates a new task
  - Parameters: `{ title, description, priority, category, attachments, column }`
  - Emits: `task:created` to all clients

- `task:update`: Updates an existing task
  - Parameters: `{ id, title, description, priority, category, attachments, column }`
  - Emits: `task:updated` to all clients

- `task:move`: Moves a task between columns
  - Parameters: `{ taskId, sourceColumn, targetColumn }`
  - Emits: `task:moved` to all clients

- `task:delete`: Deletes a task
  - Parameters: `{ taskId, column }`
  - Emits: `task:deleted` to all clients

The server emits these events to clients:

- `sync:tasks`: Sends the current state of all tasks on client connection
- `task:created`: When a task is created
- `task:updated`: When a task is updated
- `task:moved`: When a task is moved
- `task:deleted`: When a task is deleted

## 💾 Data Structure

Tasks are stored in-memory with the following structure:

```javascript
{
  todo: [],        // Tasks in "To Do" column
  inProgress: [],  // Tasks in "In Progress" column
  done: []         // Tasks in "Done" column
}
```

Each task has the following properties:

```javascript
{
  id: "unique-id",             // Randomly generated ID
  title: "Task title",         // Task title
  description: "Description",  // Task description
  priority: "Medium",          // Priority: "Low", "Medium", or "High"
  category: "Feature",         // Category: "Bug", "Feature", or "Enhancement"
  attachments: [],             // Array of attachment objects
  createdAt: "ISO-date-string" // Creation timestamp
}
```

## 🔄 Server Logic

### Connection Handling

- On new client connection:
  - Logs the connection
  - Sends the current tasks state to the client
  - Sets up event listeners for the client

- On client disconnect:
  - Logs the disconnection

### Task Management

- **Create Task**:
  - Generates a unique ID
  - Adds default values if not provided
  - Stores the task in the appropriate column
  - Broadcasts to all clients

- **Update Task**:
  - Finds the task by ID in all columns
  - Updates the task properties
  - Broadcasts the update to all clients

- **Move Task**:
  - Removes the task from the source column
  - Adds it to the target column
  - Broadcasts the move to all clients

- **Delete Task**:
  - Removes the task from its column
  - Broadcasts the deletion to all clients

## 🛠️ Development

### Adding a New Feature

1. Understand the existing WebSocket event structure
2. Add new event handlers in server.js
3. Ensure proper error handling
4. Test with multiple clients (can use browser tabs)

### Debugging

- Check server console logs for connection and event information
- All task operations are logged to the console
- WebSocket events can be monitored using Socket.IO Admin UI (if installed)

## 🔒 Security Considerations

- The server uses CORS to allow connections from any origin
- In a production environment, consider:
  - Restricting CORS to specific origins
  - Implementing authentication
  - Adding input validation
  - Using a persistent database

## 🔌 API Expansion

To expand the server's capabilities:

1. Add new event handlers in the socket.io connection block
2. Maintain a consistent event naming convention (e.g., `resource:action`)
3. Use broadcast when appropriate to update all connected clients
4. Keep the data structure consistent

## 📊 Scaling Considerations

For a production environment:

- Replace in-memory storage with a database (MongoDB recommended)
- Implement user authentication
- Add persistent file storage for attachments
- Consider using Socket.IO's adapter for multi-server setups

## 🤝 Contributing

1. Make your changes to the backend
2. Test with the frontend application
3. Verify real-time functionality works across multiple clients
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 