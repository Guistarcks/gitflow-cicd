const request = require('supertest');
const express = require('express');

// Create a simple test server
const app = express();
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Test endpoint for JSON parsing
app.post('/test-json', (req, res) => {
  res.json(req.body);
});

describe('Server Tests', () => {
  describe('Health Check', () => {
    it('should return 200 for health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        message: 'Server is running'
      });
    });
  });

  describe('Server Configuration', () => {
    it('should parse JSON requests', async () => {
      const testData = { test: 'data' };
      
      const response = await request(app)
        .post('/test-json')
        .send(testData)
        .expect(200);

      expect(response.body).toEqual(testData);
    });

    it('should handle empty JSON body', async () => {
      const response = await request(app)
        .post('/test-json')
        .send({})
        .expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe('Express Configuration', () => {
    it('should have JSON middleware enabled', async () => {
      const testData = { message: 'Hello World' };
      
      const response = await request(app)
        .post('/test-json')
        .set('Content-Type', 'application/json')
        .send(testData)
        .expect(200);

      expect(response.body).toEqual(testData);
    });
  });
}); 