// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const logger = require('../../src/logger');
const { Fragment } = require('../../src/model/fragment');
const {createErrorResponse} = require('../../src/response');

describe('GET /v1/fragments', () => {

  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });  
  
});

describe('GET /v1/fragments/:id', () => {

  test('retrieve a fragment\'s data by its id', async () => {
    const fragment = new Fragment({ ownerId: 'user2@email.com', type: 'text/plain', size: 0 });
    await fragment.save();
    await fragment.setData(Buffer.from('This is a fragment'));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('user2@email.com', 'password2');
    
    const data = await fragment.getData();
    logger.debug(`got back: ${(data)}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.string).toBe(data.string);
  });

  test('invalid id results in 404 error', async () => {
    const fragment = new Fragment({ ownerId: 'user1@email.com', type: 'text/plain', size: 0 });
    await fragment.save();
    await fragment.setData(Buffer.from('This is a fragment'));

    let errorResponse;
    await Fragment.byId(fragment.ownerId, 'invalid-id').catch((err) => {
      errorResponse = createErrorResponse(404, `${err}`);
    });

    const res = await request(app)
      .get(`/v1/fragments/invalid-id`)
      .auth('user1@email.com', 'password1');    
    
    logger.debug(`got back: ${JSON.stringify(res.body, null, 4)}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual(errorResponse);
  });

  test('.txt extension returns the fragment\'s data', async () => {
    const fragment = new Fragment({ ownerId: 'user2@email.com', type: 'text/plain', size: 0 });
    await fragment.save();
    await fragment.setData(Buffer.from('TEST FRAGMENT'));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.txt`)
      .auth('user2@email.com', 'password2');
    
    const data = await fragment.getData();    
    // logger.debug(`fragment id included in URL: ${fragment.id}`);
    logger.debug(`got back: ${(data)}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.string).toBe(data.string);
  });

  test('unsupported extension in 415 error', async () => {
    const fragment = new Fragment({ ownerId: 'user2@email.com', type: 'text/plain', size: 0 });
    await fragment.save();
    await fragment.setData(Buffer.from('TEST FRAGMENT'));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.html`)
      .auth('user2@email.com', 'password2');
    
    const errorResponse = createErrorResponse(415, `unable to convert to html`);
    
    logger.debug(`got back: ${JSON.stringify(res.body, null, 4)}`);    
    expect(res.statusCode).toBe(415);
    expect(res.body).toStrictEqual(errorResponse);
  });

});
