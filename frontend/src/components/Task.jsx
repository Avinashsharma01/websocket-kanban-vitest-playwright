import React from "react";
import { useDrag } from "react-dnd";
import PropTypes from "prop-types";

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

Task.propTypes = {
  id: PropTypes.string.isRequired,
  task: PropTypes.object.isRequired,
  column: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
};

export default Task; 