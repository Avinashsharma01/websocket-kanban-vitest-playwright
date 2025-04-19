import { useState, useEffect } from "react";
import { io } from "socket.io-client";

/**
 * Custom hook to handle WebSocket connection and task state
 * @param {string} url - WebSocket server URL
 * @returns {Object} - Socket, tasks, loading and error states
 */
const useWebSocketConnection = (url = "https://websocket-kanban-vitest-playwright-server.onrender.com") => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(url, {
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
  }, [url]);

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

  // Task operations
  const createTask = (taskData, column) => {
    if (!socket) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }
    
    socket.emit("task:create", {
      ...taskData,
      column
    });
  };

  const updateTask = (taskData, column) => {
    if (!socket) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }
    
    socket.emit("task:update", {
      ...taskData,
      column
    });
  };

  const deleteTask = (taskId, column) => {
    if (!socket) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }
    
    socket.emit("task:delete", { taskId, column });
  };

  const moveTask = (taskId, sourceColumn, targetColumn) => {
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

  return {
    socket,
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask
  };
};

export default useWebSocketConnection; 