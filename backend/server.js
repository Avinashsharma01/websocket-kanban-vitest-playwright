const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  } 
});

// In-memory storage for tasks
const tasks = {
  todo: [],
  inProgress: [],
  done: []
};

// Generate a unique ID for tasks
const generateId = () => Math.random().toString(36).substring(2, 9);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send all tasks to newly connected client
  socket.emit("sync:tasks", tasks);

  // Task creation
  socket.on("task:create", (taskData) => {
    const column = taskData.column || "todo";
    const newTask = {
      id: generateId(),
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || "Medium",
      category: taskData.category || "Feature",
      attachments: taskData.attachments || [],
      createdAt: new Date().toISOString()
    };
    
    tasks[column].push(newTask);
    io.emit("task:created", { column, task: newTask });
    console.log(`Task created: ${newTask.title} in ${column}`);
  });

  // Task update
  socket.on("task:update", (updatedTask) => {
    const { id, column } = updatedTask;
    
    for (const col in tasks) {
      const taskIndex = tasks[col].findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        tasks[col][taskIndex] = { ...tasks[col][taskIndex], ...updatedTask };
        io.emit("task:updated", { column: col, task: tasks[col][taskIndex] });
        console.log(`Task updated: ${tasks[col][taskIndex].title}`);
        break;
      }
    }
  });

  // Task move
  socket.on("task:move", ({ taskId, sourceColumn, targetColumn }) => {
    const taskIndex = tasks[sourceColumn].findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      const [movedTask] = tasks[sourceColumn].splice(taskIndex, 1);
      tasks[targetColumn].push(movedTask);
      
      io.emit("task:moved", {
        taskId,
        sourceColumn,
        targetColumn,
        task: movedTask
      });
      console.log(`Task moved: ${movedTask.title} from ${sourceColumn} to ${targetColumn}`);
    }
  });

  // Task delete
  socket.on("task:delete", ({ taskId, column }) => {
    const taskIndex = tasks[column].findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      const [deletedTask] = tasks[column].splice(taskIndex, 1);
      io.emit("task:deleted", { taskId, column });
      console.log(`Task deleted: ${deletedTask.title} from ${column}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
