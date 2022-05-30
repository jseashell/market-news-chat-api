const {
  postToConnection,
  successfulResponse,
  formatJsonError,
} = require('../../libs/api-gateway');
const { scan } = require('../../libs/dynamodb');

module.exports.send = async (event, _context, callback) => {
  let data = JSON.parse(event.body).data; // Lambda Proxy integration always has a string body
  if (!data || data?.length == 0) {
    callback(formatJsonError(500, 'Cannot send empty message'));
    return;
  }

  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }

  const connections = await scan();
  connections.Items?.forEach((connection) => {
    try {
      postToConnection(event, connection.connectionId?.S, data);
    } catch (err) {
      console.error(err);
    }
  });

  callback(null, successfulResponse);
};
