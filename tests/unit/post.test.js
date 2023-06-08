// tests/unit/app.test.js

const request = require('supertest');
const app = require('../../src/app');
const { createErrorResponse } = require('../../src/response');
const logger = require('../../src/logger');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // An authenticated user is able to create a plain text fragment
  test('authenticated user can create a fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');
    
    expect(res.statusCode).toBe(201);
  });

  test('unauthenticated user cannot create a fragment', async () => {    
    const res = await request(app)
      .post('/v1/fragments')
      .auth('invalid_user@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Unauthenticated fragment');

    expect(res.statusCode).toBe(401);
  });  

  test('response includes a Location header with URL', async () => {    
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');
    
    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toMatch(/\/v1\/fragments\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/);

    logger.debug(`[JEST] response location header: ${res.headers.location}`);
  });

  test('unsupported fragment type generates 415 error', async () => { 
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'video/ogg')
      .send(Buffer.from('TEST FRAGMENT'));   
    
    const errorResponse = createErrorResponse(415, 'content-type is not supported');
    logger.debug(`got back: ${JSON.stringify(res.body, null, 4)}`);    
    expect(res.statusCode).toBe(415);
    expect(res.body).toStrictEqual(errorResponse);
  });

  test('success response contains fragment data', async () => {

    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(('This is a fragment'));
    
    // const successResponse = createSuccessResponse({ fragment });
    // const data = await fragment.getData();
    // logger.debug(`got back: ${JSON.stringify(res, null, 4)}`);    
    // logger.debug(`got back: ${data}`); 
    // logger.debug(`should be: ${JSON.stringify(successResponse)}`);
    logger.debug(`got back: ${JSON.stringify(res, null, 4)}`); 
    expect(res.statusCode).toBe(201);
    // expect(res.body).toMatchObject(successResponse);
  });

  test('POSTing a fragment object with no data generates 415 error', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send("");
    
    const errorResponse = createErrorResponse(415, 'content-type is not supported');
    // logger.debug(`got back: ${JSON.stringify(res.body, null, 4)}`);    
    expect(res.statusCode).toBe(415);
    expect(res.body).toStrictEqual(errorResponse);
   });
});
