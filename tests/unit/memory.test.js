// test/unit/memory.test.js

// test for src/model/data/memory/index.js
// fragment metadata: https://github.com/humphd/cloud-computing-for-programmers-summer-2023/blob/main/assignments/README.md#421-fragment-overview

/* 
  Make sure you cover all of the following async functions (i.e., they all return a Promise) and pass CI:
    readFragment
    writeFragment
    readFragmentData,
    writeFragmentData
*/

const memory = require('../../src/model/data/memory');

describe('testing calls to in-memory database', () => { 

  const fragment = {
    ownerId: 'a',
    id: 'b',
    value: 123,
  };

  // test('writeFragment() writes a fragment\'s metadata to memory db', async () => { 
  //   const result = await memory.writeFragment(fragment);
  //   expect(result).resolves.toEqual(fragment);
  //   // expect(await memory.writeFragment({ownerId:'c', id:'d', value:1})).resolves;
  // });

  test('readFragment() retrieves a fragment\'s metadata', async () => { 
    await memory.writeFragment(fragment);
    const result = await memory.readFragment(fragment.ownerId, fragment.id);
    expect(result).toEqual(fragment);
  });

  test('writeFragment() doesn\'t return a fragment\'s metadata', async () => {
    const result = await memory.writeFragment({ ownerId: 'c', id: 'd', value: 1 });
    expect(result).toBe(undefined);
  });

  test('readFragmentData() retrieves a fragment\'s data', async () => { 
    await memory.writeFragmentData('ab', 'cd', Buffer.from([1,2,3]));
    const result = await memory.readFragmentData('ab', 'cd');
    expect(result).toEqual(Buffer.from([1,2,3]));
  });

  test('writeFragmentData() doesn\'t return a fragment\'s data', async () => {
    const result = await memory.writeFragmentData('ab', 'cd', Buffer.from([1,2,3]));
    expect(result).toBe(undefined);
  });

  test('writeFragmentData() and readFragmentData() should work with Buffers', async () => {
    const data = Buffer.from([1, 2, 3]);
    await memory.writeFragmentData('e', 'f', data);
    const result = await memory.readFragmentData('e', 'f');
    expect(result).toEqual(data);
  });

});

