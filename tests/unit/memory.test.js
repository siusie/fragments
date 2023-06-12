// test/unit/memory.test.js

const memory = require('../../src/model/data/memory');
const { Fragment } = require('../../src/model/fragment');

describe('testing calls to in-memory database', () => { 

  // A function for randomly generating unique email addresses
  const uniqueEmail = (email) => {
  const [name, domain] = email.split('@');
  const unique = Date.now();
  return `${name}-${unique}@${domain}`;
};

  test('readFragment() retrieves a fragment\'s metadata', async () => { 
    const fragment = new Fragment({ ownerId: uniqueEmail('testEmail@email.com'), type: 'text/plain' });
    await memory.writeFragment(fragment);
    const result = await memory.readFragment(fragment.ownerId, fragment.id);
    expect(result).toBe(fragment);
  });

  test('writeFragment() doesn\'t return a fragment\'s metadata', async () => {
    const fragment = new Fragment({ ownerId: uniqueEmail('testEmail@email.com'), type: 'text/plain' });
    const result = await memory.writeFragment(fragment);
    expect(result).toBe(undefined);
  });

  test('readFragmentData() retrieves a fragment\'s data', async () => { 
    await memory.writeFragmentData('testOwnerId', 'testId', Buffer.from([1,2,3]));
    const result = await memory.readFragmentData('testOwnerId', 'testId');
    expect(result).toStrictEqual(Buffer.from([1,2,3]));
  });

  test('readFragmentData() throws if ownerId or id is missing', async () => { 
    await memory.writeFragmentData('ownerId', 'id', Buffer.from('hello'));
    const result = await memory.readFragmentData('ownerId', 'id');
    expect(result).toStrictEqual(Buffer.from('hello'));
    expect(() => memory.readFragmentData('ownerId') ).toThrow();
    expect(() => memory.readFragmentData('id')).toThrow();
  });

  test('writeFragmentData() doesn\'t return a fragment\'s data', async () => {
    const result = await memory.writeFragmentData('ab', 'cd', Buffer.from([1,2,3]));
    expect(result).toBe(undefined);
  });

  test('writeFragmentData() and readFragmentData() should work with Buffers', async () => {
    const data = Buffer.from([1, 2, 3]);
    await memory.writeFragmentData('e', 'f', data);
    const result = await memory.readFragmentData('e', 'f');
    expect(result).toBe(data);
  });

  test('deleteFragment() deletes a fragment\'s metadata and data', async () => { 
    const fragment = new Fragment({ ownerId: uniqueEmail('user1@email.com'), type: 'text/plain', size: 10 });
    await memory.writeFragment(fragment);
    await memory.writeFragmentData(fragment.ownerId, fragment.id, Buffer.from('test fragment'));
    const f = await memory.readFragment(fragment.ownerId, fragment.id);
    const fData = await memory.readFragmentData(fragment.ownerId, fragment.id);
    expect(f).toBe(fragment);
    expect(fData).toStrictEqual(Buffer.from('test fragment'));
    await memory.deleteFragment(fragment.ownerId, fragment.id);
    const result = await memory.readFragment(fragment.ownerId, fragment.id);
    const data = await memory.readFragmentData(fragment.ownerId, fragment.id);
    expect(result).toBe(undefined);
    expect(data).toBe(undefined);
  });

});

