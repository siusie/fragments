// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('requested resource does not exist', () => {
  test('should return HTTP 404 response', () => request(app).get('/badroute').expect({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    }
  }));
});
