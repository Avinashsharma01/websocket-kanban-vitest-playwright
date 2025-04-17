import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KanbanBoard from '../../components/KanbanBoard';
import { io } from 'socket.io-client';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn()
  }))
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-chart">Chart</div>
}));

// Mock drag and drop functionality
vi.mock('react-dnd', () => ({
  DndProvider: ({ children }) => <div>{children}</div>,
  useDrag: () => [{ isDragging: false }, vi.fn()],
  useDrop: () => [{ isOver: false }, vi.fn()]
}));

vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: {}
}));

describe('Task Sync Integration Tests', () => {
  let mockSocket;
  let socketEventCallbacks = {};

  beforeEach(() => {
    socketEventCallbacks = {};
    mockSocket = {
      on: vi.fn((event, callback) => {
        socketEventCallbacks[event] = callback;
        return mockSocket;
      }),
      off: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn()
    };
    
    io.mockReturnValue(mockSocket);
  });
  
  test('syncs tasks in real-time when a new task is created', async () => {
    render(<KanbanBoard />);
    
    // Simulate server sending initial tasks
    socketEventCallbacks['sync:tasks']({
      todo: [],
      inProgress: [],
      done: []
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });
    
    // Simulate server broadcasting a new task
    socketEventCallbacks['task:created']({
      column: 'todo',
      task: {
        id: '1',
        title: 'New Task',
        description: 'This is a new task',
        priority: 'High',
        category: 'Bug',
        attachments: []
      }
    });
    
    // The new task should appear in the UI
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });
  
  test('syncs tasks in real-time when a task is moved between columns', async () => {
    render(<KanbanBoard />);
    
    // Simulate server sending initial tasks
    socketEventCallbacks['sync:tasks']({
      todo: [{
        id: '1',
        title: 'Task to Move',
        description: 'This task will be moved',
        priority: 'Medium',
        category: 'Feature',
        attachments: []
      }],
      inProgress: [],
      done: []
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });
    
    // Check that task is in the "To Do" column
    const todoColumn = screen.getByText('To Do').closest('.column');
    expect(todoColumn).toContainElement(screen.getByText('Task to Move'));
    
    // Simulate server broadcasting a task move
    socketEventCallbacks['task:moved']({
      taskId: '1',
      sourceColumn: 'todo',
      targetColumn: 'inProgress',
      task: {
        id: '1',
        title: 'Task to Move',
        description: 'This task will be moved',
        priority: 'Medium',
        category: 'Feature',
        attachments: []
      }
    });
    
    // Check that task is now in the "In Progress" column
    const inProgressColumn = screen.getByText('In Progress').closest('.column');
    expect(inProgressColumn).toContainElement(screen.getByText('Task to Move'));
    
    // Original column should no longer contain the task
    expect(todoColumn).not.toContainElement(screen.getByText('Task to Move'));
  });
  
  test('syncs tasks in real-time when a task is deleted', async () => {
    render(<KanbanBoard />);
    
    // Simulate server sending initial tasks
    socketEventCallbacks['sync:tasks']({
      todo: [{
        id: '1',
        title: 'Task to Delete',
        description: 'This task will be deleted',
        priority: 'Low',
        category: 'Enhancement',
        attachments: []
      }],
      inProgress: [],
      done: []
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });
    
    // Check that task exists
    expect(screen.getByText('Task to Delete')).toBeInTheDocument();
    
    // Simulate server broadcasting a task deletion
    socketEventCallbacks['task:deleted']({
      taskId: '1',
      column: 'todo'
    });
    
    // Task should be removed from the UI
    expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
  });
}); 