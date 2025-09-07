const Task = require('../model/appModel');

// Mock the database connection
jest.mock('../model/db', () => ({
  query: jest.fn()
}));

describe('AppModel Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task constructor', () => {
    it('should create a task object with correct properties', () => {
      const taskData = {
        task: 'Test Task',
        status: 'pending'
      };

      const task = new Task(taskData);

      expect(task.task).toBe('Test Task');
      expect(task.status).toBe('pending');
      expect(task.created_at).toBeInstanceOf(Date);
    });

    it('should handle missing properties gracefully', () => {
      const taskData = {
        task: 'Test Task'
        // missing status
      };

      const task = new Task(taskData);

      expect(task.task).toBe('Test Task');
      expect(task.status).toBeUndefined();
      expect(task.created_at).toBeInstanceOf(Date);
    });
  });

  describe('Database operations', () => {
    it('should call getAllTask with correct parameters', () => {
      const { query } = require('../model/db');
      query.mockImplementation((sql, callback) => {
        callback(null, []);
      });

      Task.getAllTask(() => {});

      expect(query).toHaveBeenCalledWith('Select * from tasks', expect.any(Function));
    });

    it('should call getTaskById with correct parameters', () => {
      const { query } = require('../model/db');
      query.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      Task.getTaskById(1, () => {});

      expect(query).toHaveBeenCalledWith('Select task from tasks where id = ? ', 1, expect.any(Function));
    });

    it('should call createTask with correct parameters', () => {
      const { query } = require('../model/db');
      query.mockImplementation((sql, task, callback) => {
        callback(null, { insertId: 1 });
      });

      const newTask = { task: 'New Task', status: 'pending' };
      Task.createTask(newTask, () => {});

      expect(query).toHaveBeenCalledWith('INSERT INTO tasks set ?', newTask, expect.any(Function));
    });

    it('should call updateById with correct parameters', () => {
      const { query } = require('../model/db');
      query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const updateTask = { task: 'Updated Task', status: 'completed' };
      Task.updateById(1, updateTask, () => {});

      expect(query).toHaveBeenCalledWith('UPDATE tasks SET task = ? WHERE id = ?', [updateTask.task, 1], expect.any(Function));
    });

    it('should call remove with correct parameters', () => {
      const { query } = require('../model/db');
      query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      Task.remove(1, () => {});

      expect(query).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = ?', [1], expect.any(Function));
    });
  });

  describe('Error handling', () => {
    it('should handle database errors in getAllTask', () => {
      const { query } = require('../model/db');
      const mockError = new Error('Database error');
      query.mockImplementation((sql, callback) => {
        callback(mockError, null);
      });

      const callback = jest.fn();
      Task.getAllTask(callback);

      expect(callback).toHaveBeenCalledWith(mockError, null);
    });

    it('should handle database errors in getTaskById', () => {
      const { query } = require('../model/db');
      const mockError = new Error('Task not found');
      query.mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      const callback = jest.fn();
      Task.getTaskById(999, callback);

      expect(callback).toHaveBeenCalledWith(mockError, null);
    });
  });
}); 