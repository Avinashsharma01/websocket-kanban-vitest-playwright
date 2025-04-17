# KanbanBoard Component Documentation

This document provides a detailed explanation of the `KanbanBoard.jsx` component, which is the core component of the WebSocket-powered Kanban board application.

## 🔍 Overview

The KanbanBoard component is a React component that implements a real-time collaborative Kanban board. It connects to a WebSocket server, manages task state, and provides an interactive interface for creating, updating, moving, and deleting tasks.

## 📋 Features

- Real-time WebSocket communication
- Drag and drop functionality for tasks
- Task creation, editing, and deletion
- File attachment uploads with previews
- Priority and category assignment
- Progress visualization with charts
- Error handling for connection issues

## 🏗️ Component Structure

The KanbanBoard component is composed of several sub-components:

1. **KanbanBoard (main component)** - Orchestrates the entire application
2. **Task** - Represents an individual task card with drag functionality
3. **Column** - Renders a column of tasks with drop functionality
4. **ProgressChart** - Visualizes task distribution and completion percentage
5. **TaskForm** - Form for creating and editing tasks

## 🧩 State Management

The component uses React's useState hooks to manage the following state:

```javascript
// Main WebSocket connection
const [socket, setSocket] = useState(null);

// Task data structured by columns
const [tasks, setTasks] = useState({
  todo: [],
  inProgress: [],
  done: []
});

// Loading indicator state
const [loading, setLoading] = useState(true);

// Error state for connection issues
const [error, setError] = useState(null);

// Task form state (for creating/editing tasks)
const [taskForm, setTaskForm] = useState({
  isOpen: false,
  task: null,
  column: null
});
```

## 🔄 WebSocket Communication

### Connection Setup

The component establishes a WebSocket connection using Socket.IO in a useEffect hook:

```javascript
useEffect(() => {
  const newSocket = io("http://localhost:5000", {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling']
  });
  
  newSocket.on('connect', () => {
    console.log('Connected to WebSocket server');
    setError(null);
  });
  
  newSocket.on('connect_error', (err) => {
    console.error('WebSocket connection error:', err);
    setError('Failed to connect to the server. Please try again later.');
  });
  
  setSocket(newSocket);
  
  return () => {
    newSocket.disconnect();
  };
}, []);
```

### Event Listeners

The component sets up event listeners for various WebSocket events:

```javascript
useEffect(() => {
  if (!socket) return;
  
  // Sync tasks when first connecting
  socket.on("sync:tasks", (tasksData) => {
    setTasks(tasksData);
    setLoading(false);
  });
  
  // Listen for task created events
  socket.on("task:created", ({ column, task }) => {
    setTasks(prev => ({
      ...prev,
      [column]: [...prev[column], task]
    }));
  });
  
  // Listen for task updated events
  socket.on("task:updated", ({ column, task }) => {
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].map(t => 
        t.id === task.id ? task : t
      )
    }));
  });
  
  // Listen for task moved events
  socket.on("task:moved", ({ taskId, sourceColumn, targetColumn, task }) => {
    setTasks(prev => ({
      ...prev,
      [sourceColumn]: prev[sourceColumn].filter(t => t.id !== taskId),
      [targetColumn]: [...prev[targetColumn], task]
    }));
  });
  
  // Listen for task deleted events
  socket.on("task:deleted", ({ taskId, column }) => {
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].filter(t => t.id !== taskId)
    }));
  });
  
  return () => {
    // Clean up event listeners
    socket.off("sync:tasks");
    socket.off("task:created");
    socket.off("task:updated");
    socket.off("task:moved");
    socket.off("task:deleted");
  };
}, [socket]);
```

### Emitting Events

The component emits events to the WebSocket server for various user actions:

```javascript
// Create a new task
socket.emit("task:create", { ...taskData, column });

// Update an existing task
socket.emit("task:update", { ...taskData, column });

// Delete a task
socket.emit("task:delete", { taskId, column });

// Move a task between columns
socket.emit("task:move", { taskId, sourceColumn, targetColumn });
```

## 🖱️ Drag and Drop Implementation

The component uses React DnD (Drag and Drop) library to implement drag and drop functionality:

### Task Component (Draggable)

```javascript
const Task = ({ id, task, column, onDelete, onEdit }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id, column },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`task ${isDragging ? "dragging" : ""}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* Task content */}
    </div>
  );
};
```

### Column Component (Droppable)

```javascript
const Column = ({ title, column, tasks, onTaskDrop, onDelete, onEdit, onAddTask }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item) => onTaskDrop(item.id, item.column, column),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      className={`column ${isOver ? "highlight" : ""}`}
    >
      {/* Column content */}
    </div>
  );
};
```

## 📊 Task Progress Visualization

The component uses Chart.js to create a bar chart visualization of task distribution:

```javascript
const ProgressChart = ({ tasks }) => {
  const data = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{
      label: 'Number of Tasks',
      data: [
        tasks.todo.length, 
        tasks.inProgress.length, 
        tasks.done.length
      ],
      backgroundColor: [/* colors */],
      borderColor: [/* colors */],
      borderWidth: 1
    }]
  };

  const options = {/* chart options */};
  
  // Calculate completion percentage
  const totalTasks = tasks.todo.length + tasks.inProgress.length + tasks.done.length;
  const completionPercentage = totalTasks > 0 
    ? Math.round((tasks.done.length / totalTasks) * 100) 
    : 0;

  return (
    <div className="progress-chart">
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
      <div className="completion-percentage">
        <h3>Project Completion</h3>
        <div className="percentage-bar">
          <div 
            className="percentage-fill" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p>{completionPercentage}% Complete</p>
      </div>
    </div>
  );
};
```

## 📝 Task Form

The TaskForm component handles both creation and editing of tasks:

```javascript
const TaskForm = ({ task, column, onSubmit, onCancel }) => {
  // Form state for fields
  const [formData, setFormData] = useState({
    id: task?.id || '',
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'Medium',
    category: task?.category || 'Feature',
    attachments: task?.attachments || []
  });
  
  // State for file upload
  const [file, setFile] = useState(null);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (file) {
      // Process file upload
      const reader = new FileReader();
      reader.onload = (event) => {
        const attachment = {
          name: file.name,
          type: file.type,
          url: event.target.result,
          size: file.size
        };
        
        onSubmit({
          ...formData,
          attachments: [...formData.attachments, attachment]
        }, column);
      };
      reader.readAsDataURL(file);
    } else {
      onSubmit(formData, column);
    }
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form">
        {/* Form fields */}
      </div>
    </div>
  );
};
```

## 🛠️ Error Handling

The component provides robust error handling for WebSocket connection issues:

```javascript
// Connection error handling
newSocket.on('connect_error', (err) => {
  console.error('WebSocket connection error:', err);
  setError('Failed to connect to the server. Please try again later.');
});

// Error display in UI
if (error) {
  return (
    <div className="error-container">
      <h2>Connection Error</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Reconnect</button>
    </div>
  );
}
```

## 🧩 Rendering Logic

The main render method of the KanbanBoard component:

```javascript
// Show loading indicator while connecting
if (loading) {
  return <div className="loading">Loading tasks...</div>;
}

return (
  <DndProvider backend={HTML5Backend}>
    <div className="kanban-container">
      <div className="board">
        <Column
          title="To Do"
          column="todo"
          tasks={tasks.todo}
          onTaskDrop={handleTaskDrop}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
          onAddTask={handleAddTask}
        />
        <Column
          title="In Progress"
          column="inProgress"
          tasks={tasks.inProgress}
          onTaskDrop={handleTaskDrop}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
          onAddTask={handleAddTask}
        />
        <Column
          title="Done"
          column="done"
          tasks={tasks.done}
          onTaskDrop={handleTaskDrop}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
          onAddTask={handleAddTask}
        />
      </div>
      
      <ProgressChart tasks={tasks} />
      
      {taskForm.isOpen && (
        <TaskForm
          task={taskForm.task}
          column={taskForm.column}
          onSubmit={handleTaskFormSubmit}
          onCancel={handleTaskFormCancel}
        />
      )}
    </div>
  </DndProvider>
);
```

## 🔄 Event Handlers

The component defines several event handlers for user interactions:

```javascript
// Add a new task
const handleAddTask = (column) => {
  setTaskForm({
    isOpen: true,
    task: null,
    column
  });
};

// Edit an existing task
const handleEditTask = (task, column) => {
  setTaskForm({
    isOpen: true,
    task,
    column
  });
};

// Submit task form (create or update)
const handleTaskFormSubmit = (taskData, column) => {
  if (!socket) {
    setError('Not connected to server. Please refresh the page.');
    return;
  }
  
  if (taskData.id) {
    // Update existing task
    socket.emit("task:update", {
      ...taskData,
      column
    });
  } else {
    // Create new task
    socket.emit("task:create", {
      ...taskData,
      column
    });
  }
  
  setTaskForm({ isOpen: false, task: null, column: null });
};

// Close task form
const handleTaskFormCancel = () => {
  setTaskForm({ isOpen: false, task: null, column: null });
};

// Delete a task
const handleDeleteTask = (taskId, column) => {
  if (!socket) {
    setError('Not connected to server. Please refresh the page.');
    return;
  }
  
  socket.emit("task:delete", { taskId, column });
};

// Move a task between columns
const handleTaskDrop = (taskId, sourceColumn, targetColumn) => {
  if (sourceColumn === targetColumn) return;
  
  if (!socket) {
    setError('Not connected to server. Please refresh the page.');
    return;
  }
  
  socket.emit("task:move", {
    taskId,
    sourceColumn,
    targetColumn
  });
};
```

## 🎨 Styling

The component uses a CSS file for styling, with class names following a BEM-like naming convention. Major style elements include:

- Container layout and responsive design
- Column and task card styling
- Drag and drop visual indicators
- Form styling and modal overlay
- Progress chart and percentage bar styling
- Error state styling

## 🔍 Key Implementation Details

1. **WebSocket Event Handling**: The component uses Socket.IO for bidirectional communication with the server. It sets up listeners for various task-related events and emits events when users perform actions.

2. **Real-time Data Sync**: When changes occur (via WebSocket events), the component updates its state, which triggers a re-render with the new data.

3. **Drag and Drop**: The component uses React DnD to implement drag and drop functionality between columns. The `useDrag` and `useDrop` hooks connect the visual elements to the drag-and-drop system.

4. **Task Form**: The TaskForm component is conditionally rendered based on the `taskForm.isOpen` state. It pre-fills form fields when editing an existing task.

5. **File Attachments**: The component uses FileReader to read uploaded files as Data URLs, which are then stored in the task's attachments array.

6. **Progress Visualization**: The ProgressChart component calculates task distribution and completion percentage, displaying them in a bar chart and progress bar.

## 🔧 Advanced Features

1. **Error Handling**: The component provides robust error handling for WebSocket connection issues, displaying a user-friendly error message with a reconnect option.

2. **Loading State**: The component shows a loading indicator while waiting for initial task data from the server.

3. **Clean Disconnection**: The component properly disconnects the WebSocket connection when unmounting to prevent memory leaks.

4. **Conditional Rendering**: Different UI states are shown based on loading, error, and form open states.

## 📚 Dependencies

The KanbanBoard component has the following dependencies:

- React (useState, useEffect)
- Socket.IO client (io)
- React DnD (useDrag, useDrop, DndProvider, HTML5Backend)
- Chart.js (Chart, CategoryScale, LinearScale, BarElement, etc.)
- React-Chartjs-2 (Bar)

## 🔍 Conclusion

The KanbanBoard component is a comprehensive implementation of a real-time collaborative task management system. It demonstrates the integration of WebSockets, drag-and-drop functionality, form handling, file uploads, and data visualization in a React application.

The component's modular structure, clean state management, and robust error handling make it maintainable and user-friendly. Its real-time capabilities enable seamless collaboration among multiple users. 