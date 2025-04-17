import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend 
} from 'chart.js';
import "./KanbanBoard.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Task item component with drag functionality
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
      <div className="task-header">
        <h3>{task.title}</h3>
        <div className="task-actions">
          <button onClick={() => onEdit(task, column)}>Edit</button>
          <button onClick={() => onDelete(task.id, column)}>X</button>
        </div>
      </div>
      <p>{task.description}</p>
      <div className="task-meta">
        <span className={`priority priority-${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
        <span className="category">{task.category}</span>
      </div>
      {task.attachments && task.attachments.length > 0 && (
        <div className="attachments">
          {task.attachments.map((attachment, index) => (
            <div key={index} className="attachment">
              {attachment.type.startsWith("image/") ? (
                <img src={attachment.url} alt="Attachment" width="50" />
              ) : (
                <a href={attachment.url} target="_blank" rel="noreferrer">
                  {attachment.name}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Column component with drop functionality
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
      <h2>{title}</h2>
      <button className="add-task-btn" onClick={() => onAddTask(column)}>
        + Add Task
      </button>
      <div className="tasks">
        {tasks.map(task => (
          <Task
            key={task.id}
            id={task.id}
            task={task}
            column={column}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
};

// Progress Chart component
const ProgressChart = ({ tasks }) => {
  const data = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        label: 'Number of Tasks',
        data: [
          tasks.todo.length, 
          tasks.inProgress.length, 
          tasks.done.length
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Task Progress'
      }
    }
  };

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

// TaskForm component
const TaskForm = ({ task, column, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: task?.id || '',
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'Medium',
    category: task?.category || 'Feature',
    attachments: task?.attachments || []
  });
  const [file, setFile] = useState(null);

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
      // Simulate file upload - in a real app, you'd upload to a server
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
        <h2>{task ? 'Edit Task' : 'Add Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Bug">Bug</option>
              <option value="Feature">Feature</option>
              <option value="Enhancement">Enhancement</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="attachment">Attachment</label>
            <input
              type="file"
              id="attachment"
              name="attachment"
              onChange={handleFileChange}
            />
          </div>
          
          {formData.attachments.length > 0 && (
            <div className="existing-attachments">
              <h4>Existing Attachments</h4>
              {formData.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  {attachment.type.startsWith('image/') ? (
                    <img src={attachment.url} alt="Attachment" width="50" />
                  ) : (
                    <span>{attachment.name}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {task ? 'Update Task' : 'Add Task'}
            </button>
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function KanbanBoard() {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskForm, setTaskForm] = useState({
    isOpen: false,
    task: null,
    column: null
  });

  // Initialize WebSocket connection
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

  // Set up WebSocket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Sync tasks
    socket.on("sync:tasks", (tasksData) => {
      setTasks(tasksData);
      setLoading(false);
    });
    
    // Task created
    socket.on("task:created", ({ column, task }) => {
      setTasks(prev => ({
        ...prev,
        [column]: [...prev[column], task]
      }));
    });
    
    // Task updated
    socket.on("task:updated", ({ column, task }) => {
      setTasks(prev => ({
        ...prev,
        [column]: prev[column].map(t => 
          t.id === task.id ? task : t
        )
      }));
    });
    
    // Task moved
    socket.on("task:moved", ({ taskId, sourceColumn, targetColumn, task }) => {
      setTasks(prev => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(t => t.id !== taskId),
        [targetColumn]: [...prev[targetColumn], task]
      }));
    });
    
    // Task deleted
    socket.on("task:deleted", ({ taskId, column }) => {
      setTasks(prev => ({
        ...prev,
        [column]: prev[column].filter(t => t.id !== taskId)
      }));
    });
    
    return () => {
      socket.off("sync:tasks");
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:moved");
      socket.off("task:deleted");
    };
  }, [socket]);

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

  if (error) {
    return (
      <div className="error-container">
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reconnect</button>
      </div>
    );
  }

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
}

export default KanbanBoard;
