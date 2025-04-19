import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useWebSocketConnection from "../hooks/useWebSocketConnection";
import Column from "./Column";
import ProgressChart from "./ProgressChart";
import TaskForm from "./TaskForm";
import "./KanbanBoard.css";

/**
 * Main KanbanBoard component that orchestrates the entire application
 */
function KanbanBoard() {
  // Use custom hook for WebSocket connection and tasks state
  const { tasks, loading, error, createTask, updateTask, deleteTask, moveTask } = 
    useWebSocketConnection();

  // Local state for task form display
  const [taskForm, setTaskForm] = useState({
    isOpen: false,
    task: null,
    column: null
  });

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
    if (taskData.id) {
      // Update existing task
      updateTask(taskData, column);
    } else {
      // Create new task
      createTask(taskData, column);
    }
    
    setTaskForm({ isOpen: false, task: null, column: null });
  };

  // Close task form
  const handleTaskFormCancel = () => {
    setTaskForm({ isOpen: false, task: null, column: null });
  };

  // Display error state if there's a connection error
  if (error) {
    return (
      <div className="error-container">
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reconnect</button>
      </div>
    );
  }

  // Display loading state while connecting to server and retrieving initial data
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
            onTaskDrop={moveTask}
            onDelete={deleteTask}
            onEdit={handleEditTask}
            onAddTask={handleAddTask}
          />
          <Column
            title="In Progress"
            column="inProgress"
            tasks={tasks.inProgress}
            onTaskDrop={moveTask}
            onDelete={deleteTask}
            onEdit={handleEditTask}
            onAddTask={handleAddTask}
          />
          <Column
            title="Done"
            column="done"
            tasks={tasks.done}
            onTaskDrop={moveTask}
            onDelete={deleteTask}
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
