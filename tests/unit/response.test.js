// tests/unit/response.test.js

const { createErrorResponse, createSuccessResponse } = require('../../src/response');

// Define (i.e., name) the set of tests we're about to do
describe('API Responses', () => {
  // Write a test for calling createErrorResponse()
  test('createErrorResponse()', () => {
    const errorResponse = createErrorResponse(404, 'not found');
    // Expect the result to look like the following
    expect(errorResponse).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'not found',
      },
    });
  });

  // Write a test for calling createSuccessResponse() with no argument
  test('createSuccessResponse()', () => {
    // No arg passed
    const successResponse = createSuccessResponse();
    // Expect the result to look like the following
    expect(successResponse).toEqual({
      status: 'ok',
    });
  });

  // Write a test for calling createSuccessResponse() with an argument
  test('createSuccessResponse(data)', () => {
    // Data argument included
    const data = { a: 1, b: 2 };
    const successResponse = createSuccessResponse(data);
    // Expect the result to look like the following
    expect(successResponse).toEqual({
      status: 'ok',
      a: 1,
      b: 2,
    });
  });

// Test for a generated response containing a fragment object
test('success response that contains an object' ,()=>{

  // the fragment's metadata
  const data = {
    "fragment": {
      "id": "30a84843-0cd4-4975-95ba-b96112aea189",
      "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
      "created": "2021-11-02T15:09:50.403Z",
      "updated": "2021-11-02T15:09:50.403Z",
      "type": "text/plain",
      "size": 256,
  }};

  const successResponse = createSuccessResponse(data);

  // testing response object's length
  expect(Object.keys(successResponse)).toHaveLength(2);
  expect(Object.keys(successResponse.fragment)).toHaveLength(6);

  // response must contain a "status" property
  expect(successResponse).toHaveProperty('status','ok');

  // fragment object in the response must contain the following properties & values
  expect(successResponse).toHaveProperty('fragment', {'id': '30a84843-0cd4-4975-95ba-b96112aea189','ownerId': '11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a','created': '2021-11-02T15:09:50.403Z','updated':'2021-11-02T15:09:50.403Z','type':'text/plain','size':256});
  });
});
