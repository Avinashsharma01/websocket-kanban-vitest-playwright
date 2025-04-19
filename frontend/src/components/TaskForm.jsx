import React, { useState } from "react";
import PropTypes from "prop-types";

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

TaskForm.propTypes = {
  task: PropTypes.object,
  column: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default TaskForm; 