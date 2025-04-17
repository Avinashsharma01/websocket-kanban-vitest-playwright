# WebSocket-Powered Kanban Board Frontend

This is the frontend application for a real-time Kanban board built with React, Socket.IO, React DnD, and Chart.js. The application provides a collaborative task management system where users can create, update, delete, and move tasks between columns in real-time.

## 📋 Features

- **Real-time Updates**: All changes sync instantly across all connected clients
- **Drag and Drop**: Intuitive task movement between columns
- **Task Management**: Create, edit, and delete tasks with ease
- **Priority & Category**: Assign importance and type to each task
- **File Attachments**: Upload and preview files for each task
- **Progress Visualization**: Chart displaying task distribution and completion percentage

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Backend server running on port 5000 (see backend README)

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd websocket-kanban-vitest-playwright/frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🏗️ Project Structure

```
frontend/
│
├── src/                        # Source files
│   ├── components/             # React components
│   │   ├── KanbanBoard.jsx     # Main Kanban board component
│   │   └── KanbanBoard.css     # Styling for the Kanban board
│   │
│   ├── tests/                  # Test files
│   │   ├── unit/               # Unit tests
│   │   ├── integration/        # Integration tests
│   │   └── e2e/                # End-to-end tests
│   │
│   ├── App.jsx                 # Main App component
│   ├── main.jsx                # Application entry point
│   └── setupTests.js           # Test setup
│
├── public/                     # Static files
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
├── package.json                # Project dependencies and scripts
└── README.md                   # This file
```

## 📦 Key Dependencies

- **React**: UI library
- **Socket.IO Client**: Real-time communication with the backend
- **React DnD**: Drag and drop functionality
- **Chart.js & React-Chartjs-2**: Data visualization
- **Vite**: Build tool and development server
- **Vitest**: Testing framework
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing framework

## 🧩 Component Overview

### KanbanBoard

The main component that orchestrates the entire application. It:
- Establishes and maintains WebSocket connection
- Manages the application state
- Handles all task operations
- Renders the columns, tasks, and chart

### Sub-components

- **Column**: Renders a column of tasks and handles drop events
- **Task**: Displays task information and handles drag events
- **TaskForm**: Form for creating and editing tasks
- **ProgressChart**: Visualizes task distribution and completion percentage

## 📡 WebSocket Events

The frontend listens for these events from the server:
- `sync:tasks`: Initial task data on connection
- `task:created`: When a new task is added
- `task:updated`: When a task is edited
- `task:moved`: When a task changes columns
- `task:deleted`: When a task is removed

The frontend emits these events to the server:
- `task:create`: To create a new task
- `task:update`: To modify an existing task
- `task:move`: To change a task's column
- `task:delete`: To remove a task

## 🧪 Testing

### Running Tests

```
# Run unit and integration tests
npm test

# Run end-to-end tests
npm run test:e2e
```

### Test Structure

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test WebSocket event handling and state updates
- **E2E Tests**: Test the full user experience

## 🛠️ Development

### Adding a New Feature

1. Make sure you understand how the WebSocket communication works
2. Update the relevant components
3. Add corresponding tests
4. Test the real-time functionality with multiple browser tabs

### Debugging

- Check the browser console for WebSocket connection issues
- The application has built-in error handling for connection problems
- Use the React Developer Tools to inspect component state

## 🔄 State Management

The application uses React's useState and useEffect hooks for state management:

- `tasks`: Object containing arrays of tasks for each column
- `socket`: WebSocket connection instance
- `loading`: Loading state indicator
- `error`: Error state for connection issues
- `taskForm`: Form state for creating/editing tasks

## 📊 Style Guide

The application follows these styling patterns:

- BEM-like class naming convention
- Component-specific CSS files
- Responsive design with mobile support
- Clear visual indicators for drag and drop interactions

## 🤝 Contributing

1. Ensure the backend server is running
2. Make your changes to the frontend
3. Write or update tests
4. Verify real-time functionality works
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 