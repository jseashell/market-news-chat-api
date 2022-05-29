const {
  DynamoDBClient,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');
const {
  formatJsonError,
  successfulResponse,
} = require('../../libs/api-gateway');

const connectionTable = process.env.CONNECTION_TABLE;

module.exports.disconnect = async (event, _context, callback) => {
  const connectionId = event.requestContext?.connectionId;
  if (!connectionId) {
    callback(
      formatJsonError(
        400,
        'Cannot delete connection due to falsy connection ID.'
      )
    );
    return;
  }

  const command = new DeleteItemCommand({
    TableName: connectionTable,
    Key: {
      connectionId: {
        S: connectionId,
      },
    },
  });

  const client = new DynamoDBClient({ region: process.env.REGION });

  try {
    await client.send(command);
    callback(null, successfulResponse);
  } catch (err) {
    callback(formatJsonError(500, err));
  }
};
