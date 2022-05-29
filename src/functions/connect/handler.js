const { putItem } = require('../../libs/dynamodb');
const {
  formatJsonError,
  successfulResponse,
} = require('../../libs/api-gateway');

module.exports.connect = async (event, _context, callback) => {
  const connectionId = event.requestContext?.connectionId;
  if (!connectionId) {
    callback(
      formatJsonError(400, 'Cannot add connection due to falsy connection ID.')
    );
    return;
  }

  try {
    putItem(connectionId);
    callback(null, successfulResponse);
  } catch (err) {
    callback(formatJsonError(500, err));
  }
};
