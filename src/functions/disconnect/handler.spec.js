const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { successfulResponse } = require('../../libs/api-gateway');
const { disconnect } = require('./handler');

jest.mock('@aws-sdk/client-dynamodb');

describe('disconnect', () => {
  const mockConnectionId = 'example-id-000';
  const mockEvent = { requestContext: { connectionId: mockConnectionId } };
  const mockContext = null; // unused in handler.js

  it("should remove the client's connection ID from an RDS database", async () => {
    const send = jest.fn();
    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementationOnce(send);

    const callback = jest.fn();

    await disconnect(mockEvent, mockContext, callback);

    expect(send).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(null, successfulResponse);
  });

  it('should callback a 400 error when a connection ID is not provided in the request context', async () => {
    jest
      .spyOn(DynamoDBClient.prototype, 'send')
      .mockImplementationOnce(jest.fn());

    const invalidEvent = { requestContext: { someOtherKey: 'any' } };
    const mockCallback = jest.fn();

    await disconnect(invalidEvent, mockContext, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith({
      statusCode: 400,
      body: JSON.stringify({
        message: 'error',
        error: {
          message: `Cannot delete connection due to falsy connection ID.`,
          stack: {},
        },
      }),
    });
  });

  it('should callback a 500 error when deletion fails', async () => {
    const sendError = jest.fn().mockImplementation((_command) => {
      throw new Error('test');
    });
    jest
      .spyOn(DynamoDBClient.prototype, 'send')
      .mockImplementationOnce(sendError);

    const mockCallback = jest.fn();

    await disconnect(mockEvent, mockContext, mockCallback);

    expect(sendError).toHaveBeenCalled();
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
