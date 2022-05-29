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
