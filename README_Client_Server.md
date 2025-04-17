# 📝 WebSocket-Powered Kanban Board

A real-time collaborative Kanban board application built with React, Socket.IO, Express, React DnD, and Chart.js. This project demonstrates the implementation of real-time task management, drag-and-drop functionality, file attachments, and data visualization.

## 🌟 Features

- **Real-time Collaboration**: All changes instantly sync across all connected clients
- **Interactive UI**: Drag and drop tasks between columns
- **Complete Task Management**: Create, edit, delete, and move tasks
- **Task Details**: Priority, category, and file attachments
- **Data Visualization**: Real-time progress chart
- **Responsive Design**: Works on desktop and mobile devices
- **Comprehensive Testing**: Unit, integration, and E2E tests

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation & Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd websocket-kanban-vitest-playwright
   ```

2. Install backend dependencies and start the server
   ```
   cd backend
   npm install
   npm run dev
   ```

3. In a new terminal, install frontend dependencies and start the application
   ```
   cd frontend
   npm install
   npm run dev
   ```

4. Open the application in your browser
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:5000](http://localhost:5000)

## 🏗️ Project Structure

```
websocket-kanban-vitest-playwright/
│
├── backend/                 # WebSocket server
│   ├── server.js            # Express + Socket.IO server
│   ├── package.json         # Backend dependencies
│   └── README.md            # Backend documentation
│
├── frontend/                # React application
│   ├── src/                 # Source files
│   │   ├── components/      # React components
│   │   ├── tests/           # Test files
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Entry point
│   │
│   ├── public/              # Static files
│   ├── package.json         # Frontend dependencies
│   └── README.md            # Frontend documentation
│
└── README.md                # Project documentation
```

## 🎯 Main Components

### Backend

- **Express Server**: HTTP server for Socket.IO
- **Socket.IO**: WebSocket communication
- **In-memory Storage**: Task data persistence

### Frontend

- **React**: UI components and state management
- **Socket.IO Client**: Real-time communication with the server
- **React DnD**: Drag and drop functionality
- **Chart.js**: Data visualization

## 🔄 WebSocket Communication

The application uses a set of standardized events for real-time communication:

### Client to Server
- `task:create`: Create a new task
- `task:update`: Update an existing task
- `task:move`: Move a task between columns
- `task:delete`: Delete a task

### Server to Clients
- `sync:tasks`: Initial data sync on connection
- `task:created`: Broadcast new task
- `task:updated`: Broadcast task update
- `task:moved`: Broadcast task movement
- `task:deleted`: Broadcast task deletion

## 📊 Task Management

Tasks are organized into three columns:
- **To Do**: Tasks that need to be done
- **In Progress**: Tasks currently being worked on
- **Done**: Completed tasks

Each task includes:
- Title and description
- Priority (Low, Medium, High)
- Category (Bug, Feature, Enhancement)
- File attachments
- Creation timestamp

## 🧪 Testing

The project includes comprehensive testing at multiple levels:

### Frontend Tests

```
cd frontend
# Run unit and integration tests
npm test
# Run end-to-end tests
npm run test:e2e
```

### Testing Structure
- **Unit Tests**: Component and function testing
- **Integration Tests**: WebSocket event handling
- **E2E Tests**: Complete user flows

## 💡 Development Guide

### Adding New Features

1. Understand the WebSocket event system
2. Implement server-side event handlers (backend)
3. Implement client-side event handlers (frontend)
4. Update UI components as needed
5. Add appropriate tests

### Best Practices

- Follow the existing event naming convention (`resource:action`)
- Ensure real-time updates work properly
- Test with multiple browser tabs to verify synchronization
- Add appropriate error handling
- Keep the UI responsive and intuitive

## 🚀 Deployment Considerations

For a production deployment:

- Use a persistent database instead of in-memory storage
- Implement user authentication and authorization
- Set up a proper file storage solution for attachments
- Configure CORS for specific origins
- Set up proper WebSocket scaling (Redis adapter for Socket.IO)

## 👥 Collaboration Testing

To test the real-time collaboration:

1. Start both the backend and frontend servers
2. Open the application in multiple browser tabs
3. Make changes in one tab and observe the updates in the others
4. Try creating, editing, moving, and deleting tasks

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Socket.IO](https://socket.io/) for real-time communication
- [React DnD](https://react-dnd.github.io/react-dnd/) for drag and drop functionality
- [Chart.js](https://www.chartjs.org/) for data visualization
- [React](https://reactjs.org/) for UI components
- [Vitest](https://vitest.dev/) for testing
- [Playwright](https://playwright.dev/) for E2E testing 