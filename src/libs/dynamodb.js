const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

const connectionTable = process.env.CONNECTION_TABLE;

const newClient = () => new DynamoDBClient({ region: process.env.REGION });

module.exports.putItem = (connectionId) => {
  const command = new PutItemCommand({
    TableName: connectionTable,
    Item: {
      connectionId: {
        S: connectionId,
      },
    },
  });

  return newClient().send(command);
};

module.exports.deleteItem = (connectionId) => {
  const command = new DeleteItemCommand({
    TableName: connectionTable,
    Key: {
      connectionId: {
        S: connectionId,
      },
    },
  });

  return newClient().send(command);
};

module.exports.scan = async () => {
  const command = new ScanCommand({
    TableName: connectionTable,
    ProjectionExpression: 'connectionId',
  });

  return newClient().send(command);
};
