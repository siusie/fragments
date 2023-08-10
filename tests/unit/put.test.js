// tests/unit/put.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const hash = require('../../src/hash');

const fragment1 = new Fragment({ ownerId: hash('user1@email.com'), type: 'text/plain', size: 0 });

describe('PUT /v1/fragments', () => { 
  test('a fragment\'s data can be modified', async () => {    
    await fragment1.save();
    await fragment1.setData(Buffer.from('This is a fragment'));

    const res = await request(app)
      .put(`/v1/fragments/${fragment1.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', fragment1.type)
      .send(Buffer.from('This fragment has been modified'));
    
    const data = await fragment1.getData();
    expect(res.statusCode).toBe(200);
    expect(data.toString()).toBe('This fragment has been modified');
  });

  test('a fragment\'s type cannot be modified', async () => { 
    const fragment = new Fragment({ ownerId: hash('user1@email.com'), type: 'text/markdown' });
    await fragment.save();
    await fragment.setData(Buffer.from('## This is a fragment'));

    const res = await request(app)
      .put(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('## This fragment has been modified'));    
  
    expect(res.statusCode).toBe(400);
  });
});
