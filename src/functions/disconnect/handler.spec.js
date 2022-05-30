const { successfulResponse } = require('../../libs/api-gateway');
const { deleteItem } = require('../../libs/dynamodb');
const { disconnect } = require('./handler');

jest.mock('../../libs/dynamodb');

describe('disconnect', () => {
  const mockConnectionId = 'example-id-000';
  const mockEvent = { requestContext: { connectionId: mockConnectionId } };
  const mockContext = null; // unused in handler.js
  let mockDeleteItem;

  beforeEach(() => {
    mockDeleteItem = jest.fn();
    deleteItem.mockImplementationOnce(mockDeleteItem);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should remove the client's connection ID from an RDS database", async () => {
    const mockCallback = jest.fn();
    await disconnect(mockEvent, mockContext, mockCallback);

    expect(mockDeleteItem).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(null, successfulResponse);
  });

  it('should callback a 400 error when a connection ID is not provided in the request context', async () => {
    const invalidEvent = { requestContext: { someOtherKey: 'any' } };
    const mockCallback = jest.fn();
    await disconnect(invalidEvent, mockContext, mockCallback);

    expect(mockDeleteItem).not.toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
      })
    );
  });

  it('should callback a 500 error when deletion fails', async () => {
    deleteItem.mockReset();
    const mockSendError = jest.fn().mockImplementation(() => {
      throw new Error('test');
    });
    deleteItem.mockImplementationOnce(mockSendError);

    const mockCallback = jest.fn();
    await disconnect(mockEvent, mockContext, mockCallback);

    expect(mockSendError).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
      })
    );
  });
});
