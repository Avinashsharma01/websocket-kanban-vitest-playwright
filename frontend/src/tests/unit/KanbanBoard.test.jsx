import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('KanbanBoard Component', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn()
    };
    
    io.mockReturnValue(mockSocket);
  });

  test('renders loading state initially', () => {
    render(<KanbanBoard />);
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('connects to WebSocket on mount', () => {
    render(<KanbanBoard />);
    expect(io).toHaveBeenCalledWith('http://localhost:5000');
  });

  test('registers event listeners for WebSocket events', () => {
    render(<KanbanBoard />);
    
    // Check that WebSocket event listeners are registered
    expect(mockSocket.on).toHaveBeenCalledWith('sync:tasks', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('task:created', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('task:updated', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('task:moved', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('task:deleted', expect.any(Function));
  });

  test('renders board after tasks are loaded', async () => {
    // Manually trigger the sync:tasks event
    const onMock = vi.fn().mockImplementation((event, callback) => {
      if (event === 'sync:tasks') {
        callback({
          todo: [{ id: '1', title: 'Test Task', description: 'Task description', priority: 'Medium', category: 'Feature', attachments: [] }],
          inProgress: [],
          done: []
        });
      }
      return mockSocket;
    });
    
    mockSocket.on.mockImplementation(onMock);
    
    render(<KanbanBoard />);
    
    // Wait for the board to render
    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
    
    // Check that our test task is rendered
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
