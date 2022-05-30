module.exports.successfulResponse = {
  statusCode: 200,
  body: JSON.stringify({ message: 'success' }),
};

module.exports.formatJsonError = (statusCode, error) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify({
      message: 'error',
      error: {
        message:
          typeof error == 'string'
            ? error
            : error.message
            ? error.message
            : 'Unknown error',
        stack: error.stack || {},
      },
    }),
  };
};

module.exports.postToConnection = async (event, connectionId, data) => {
  const command = new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: data,
  });

  const client = new ApiGatewayManagementApiClient({
    region: process.env.REGION,
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
  });

  return client.send(command);
};
