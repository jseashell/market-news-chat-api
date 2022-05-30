const {
  postToConnection,
  successfulResponse,
} = require('../../libs/api-gateway');
const { scan } = require('../../libs/dynamodb');
const { send } = require('./handler');

jest.mock('../../libs/api-gateway');
jest.mock('../../libs/dynamodb');

describe('send', () => {
  const mockEvent = { body: JSON.stringify({ data: 'a message to send' }) };
  const mockContext = null; // unused in handler.js
  const mockConnections = [
    {
      connectionId: {
        S: 'example-id-000',
      },
    },
    {
      connectionId: {
        S: 'example-id-111',
      },
    },
  ];
  let mockScan;
  let mockPostToConnection;

  beforeEach(() => {
    mockScan = jest.fn().mockResolvedValue({
      Items: mockConnections,
    });
    scan.mockImplementation(mockScan);

    mockPostToConnection = jest.fn();
    postToConnection.mockImplementation(mockPostToConnection);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should callback a 200 success when the message is posted to all scanned connections', async () => {
    const mockCallback = jest.fn();
    await send(mockEvent, mockContext, mockCallback);

    expect(mockScan).toHaveBeenCalled();
    expect(mockPostToConnection).toHaveBeenCalledTimes(mockConnections.length);
    expect(mockCallback).toHaveBeenCalledWith(null, successfulResponse);
  });

  it('should callback a 400 error when data is not provided in the request body', async () => {
    const invalidEvent = { body: JSON.stringify({ data: '' }) };
    const mockCallback = jest.fn();
    await send(invalidEvent, mockContext, mockCallback);

    expect(mockScan).not.toHaveBeenCalled();
    expect(mockPostToConnection).not.toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalled();
  });

  it('should log an error when sending to a single client fails', async () => {
    postToConnection.mockReset();
    const mockPostToConnectionError = jest.fn().mockImplementation(() => {
      throw new Error('test');
    });
    postToConnection.mockImplementationOnce(mockPostToConnectionError);

    const mockErrorLog = jest.fn();
    console.error = mockErrorLog;

    const mockCallback = jest.fn();
    await send(mockEvent, mockContext, mockCallback);

    expect(mockScan).toHaveBeenCalled();
    expect(mockPostToConnectionError).toHaveBeenCalled();
    expect(mockErrorLog).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        statusCode: 200,
      })
    );
  });
});