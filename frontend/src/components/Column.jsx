import React from "react";
import { useDrop } from "react-dnd";
import PropTypes from "prop-types";
import Task from "./Task";

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

Column.propTypes = {
  title: PropTypes.string.isRequired,
  column: PropTypes.string.isRequired,
  tasks: PropTypes.array.isRequired,
  onTaskDrop: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onAddTask: PropTypes.func.isRequired
};

export default Column; 