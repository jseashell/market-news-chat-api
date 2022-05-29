const { successfulResponse } = require('../../libs/api-gateway');
const { putItem } = require('../../libs/dynamodb');
const { connect } = require('./handler');

describe('connect', () => {
  const mockConnectionId = 'example-id-000';
  const mockEvent = { requestContext: { connectionId: mockConnectionId } };
  const mockContext = null; // unused in handler.js

  it("should insert the client's connection ID into an RDS database", async () => {
    const putItem = jest.fn();

    const callback = jest.fn();

    await connect(mockEvent, mockContext, callback);

    expect(send).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(null, successfulResponse);
  });

  it('should callback a 400 error when a connection ID is not provided in the request context', async () => {
    jest.mock(putItem).mockImplementation(jest.fn());

    const invalidEvent = { requestContext: { someOtherKey: 'any' } };
    const mockCallback = jest.fn();

    await connect(invalidEvent, mockContext, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith({
      statusCode: 400,
      body: JSON.stringify({
        message: 'error',
        error: {
          message: 'Cannot add connection due to falsy connection ID.',
          stack: {},
        },
      }),
    });
  });

  it('should callback a 500 error when insertion fails', async () => {
    jest.mock(putItem).mockImplementationOnce(() => {
      throw new Error('test');
    });

    const mockCallback = jest.fn();

    await connect(mockEvent, mockContext, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith({
      statusCode: 500,
      body: JSON.stringify({
        message: 'error',
        error: {
          message: 'Unknown error',
          stack: {},
        },
      }),
    });
  });
});
