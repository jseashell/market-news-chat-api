const { successfulResponse } = require('../../libs/api-gateway');
const { putItem } = require('../../libs/dynamodb');
const { connect } = require('./handler');

jest.mock('../../libs/dynamodb');

describe('connect', () => {
  const mockConnectionId = 'example-id-000';
  const mockEvent = { requestContext: { connectionId: mockConnectionId } };
  const mockContext = null; // unused in handler.js
  let mockPutItem;

  beforeEach(() => {
    mockPutItem = jest.fn();
    putItem.mockImplementationOnce(mockPutItem);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should insert the client's connection ID into an RDS database", async () => {
    const mockCallback = jest.fn();
    await connect(mockEvent, mockContext, mockCallback);

    expect(mockPutItem).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(null, successfulResponse);
  });

  it('should callback a 400 error when a connection ID is not provided in the request context', async () => {
    const invalidEvent = { requestContext: { someOtherKey: 'any' } };
    const mockCallback = jest.fn();
    await connect(invalidEvent, mockContext, mockCallback);

    expect(mockPutItem).not.toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
      })
    );
  });

  it('should callback a 500 error when insertion fails', async () => {
    putItem.mockReset();
    const mockSendError = jest.fn().mockImplementation(() => {
      throw new Error('test');
    });
    putItem.mockImplementationOnce(mockSendError);

    const mockCallback = jest.fn();
    await connect(mockEvent, mockContext, mockCallback);

    expect(mockSendError).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
      })
    );
  });
});
