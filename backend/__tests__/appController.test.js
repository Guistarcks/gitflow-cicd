const request = require('supertest');
const express = require('express');
const appController = require('../controller/appController');

// Mock the model to avoid database calls during testing
jest.mock('../model/appModel', () => {
  return {
    getAllTask: jest.fn(),
    getTaskById: jest.fn(),
    createTask: jest.fn(),
    updateById: jest.fn(),
    remove: jest.fn()
  };
});

const app = express();
app.use(express.json());

// Set up routes to match the actual structure
app.get('/tasks', appController.list_all_tasks);
app.post('/tasks', appController.create_a_task);
app.get('/tasks/:taskId', appController.read_a_task);
app.put('/tasks/:taskId', appController.update_a_task);
app.delete('/tasks/:taskId', appController.delete_a_task);

describe('AppController Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /tasks', () => {
    it('should return all tasks successfully', async () => {
      const mockTasks = [
        { id: 1, task: 'Task 1', status: 'pending' },
        { id: 2, task: 'Task 2', status: 'completed' }
      ];
      
      const { getAllTask } = require('../model/appModel');
      getAllTask.mockImplementation((callback) => {
        callback(null, mockTasks);
      });

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body).toEqual(mockTasks);
      expect(getAllTask).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when getting tasks', async () => {
      const { getAllTask } = require('../model/appModel');
      getAllTask.mockImplementation((callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/tasks')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(getAllTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /tasks/:taskId', () => {
    it('should return a specific task by id', async () => {
      const mockTask = [{ id: 1, task: 'Task 1', status: 'pending' }];
      
      const { getTaskById } = require('../model/appModel');
      getTaskById.mockImplementation((taskId, callback) => {
        callback(null, mockTask);
      });

      const response = await request(app)
        .get('/tasks/1')
        .expect(200);

      expect(response.body).toEqual(mockTask);
      expect(getTaskById).toHaveBeenCalledWith('1', expect.any(Function));
    });

    it('should handle errors when getting task by id', async () => {
      const { getTaskById } = require('../model/appModel');
      getTaskById.mockImplementation((taskId, callback) => {
        callback(new Error('Task not found'), null);
      });

      const response = await request(app)
        .get('/tasks/999')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task successfully', async () => {
      const newTask = { task: 'New Task', status: 'pending' };
      const createdTaskId = 3;
      
      const { createTask } = require('../model/appModel');
      createTask.mockImplementation((task, callback) => {
        callback(null, createdTaskId);
      });

      const response = await request(app)
        .post('/tasks')
        .send(newTask)
        .expect(200);

      expect(response.body).toBe(createdTaskId);
      expect(createTask).toHaveBeenCalledWith(
        expect.objectContaining(newTask),
        expect.any(Function)
      );
    });

    it('should return 400 for invalid task data', async () => {
      const invalidTask = { task: 'Task without status' };

      const response = await request(app)
        .post('/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'Please provide task/status'
      });
    });

    it('should return 400 for missing task field', async () => {
      const invalidTask = { status: 'pending' };

      const response = await request(app)
        .post('/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'Please provide task/status'
      });
    });
  });

  describe('PUT /tasks/:taskId', () => {
    it('should update a task successfully', async () => {
      const updateData = { task: 'Updated Task', status: 'completed' };
      const updateResult = { affectedRows: 1 };
      
      const { updateById } = require('../model/appModel');
      updateById.mockImplementation((taskId, task, callback) => {
        callback(null, updateResult);
      });

      const response = await request(app)
        .put('/tasks/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updateResult);
      expect(updateById).toHaveBeenCalledWith(
        '1',
        expect.objectContaining(updateData),
        expect.any(Function)
      );
    });

    it('should handle errors when updating task', async () => {
      const { updateById } = require('../model/appModel');
      updateById.mockImplementation((taskId, task, callback) => {
        callback(new Error('Update failed'), null);
      });

      const response = await request(app)
        .put('/tasks/1')
        .send({ task: 'Updated Task', status: 'completed' })
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /tasks/:taskId', () => {
    it('should delete a task successfully', async () => {
      const { remove } = require('../model/appModel');
      remove.mockImplementation((taskId, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .delete('/tasks/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Task successfully deleted' });
      expect(remove).toHaveBeenCalledWith('1', expect.any(Function));
    });

    it('should handle errors when deleting task', async () => {
      const { remove } = require('../model/appModel');
      remove.mockImplementation((taskId, callback) => {
        callback(new Error('Delete failed'), null);
      });

      const response = await request(app)
        .delete('/tasks/1')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });
}); 