const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} = require('@aws-sdk/client-apigatewaymanagementapi');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { formatJsonError, successfulResponse } = require('./src/libs');

const connectionTable = process.env.CONNECTION_TABLE;

module.exports.defaultHandler = (event, _context, callback) => {
  console.warn(`Default handler invoked:\n${event}`);
  callback(null, formatJsonError(404, 'No handler found'));
};

module.exports.send = (event, _context, callback) => {
  getAllConnections()
    .then((connectionData) => {
      connectionData.Items?.forEach((connection) => {
        sendToConnection(event, connection.connectionId?.S);
      });
    })
    .then(() => callback(null, successfulResponse))
    .catch((err) => callback(formatJsonError(500, err)));
};

const getAllConnections = async () => {
  const client = new DynamoDBClient({ region: process.env.REGION });
  const command = new ScanCommand({
    TableName: connectionTable,
    ProjectionExpression: 'connectionId',
  });
  return client.send(command);
};

const sendToConnection = (event, connectionId) => {
  let postData = JSON.parse(event.body).data; // Lambda Proxy integration always has a string body
  if (postData?.length == 0) {
    throw new Error(`Cannot send an empty message`);
  }

  if (typeof postData === 'object') {
    postData = JSON.stringify(postData);
  }

  const command = new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: postData,
  });

  new ApiGatewayManagementApiClient({
    region: process.env.REGION,
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
  })
    .send(command)
    .catch((err) => console.error('ERROR', err));
};

// TODO
// module.exports.auth = async (event) => {
//   const apiOptions = {};
//   const tmp = event.methodArn.split(':');
//   const apiGatewayArnTmp = tmp[5].split('/');
//   const awsAccountId = tmp[4];
//   const region = tmp[3];
//   apiOptions.apiId = apiGatewayArnTmp[0];
//   apiOptions.stage = apiGatewayArnTmp[1];

//   var resourceArn = `arn:aws:execute-api:${region}:${awsAccountId}:${apiId}/${stage}/*`;

//   let effect = 'Deny';

//   const secret = event.authorizationToken || null;
//   if (secret) {
//     const finnhubSecret = 'ca0igiiad3i2bhd5pmc0';
//     const clientSecret = 'jcs080291';
//     if (secret === finnhubSecret || secret === clientSecret) {
//       effect = 'Allow';
//     }
//   }

//   // Finnhub API secret
//   //https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-output.html
//   const policy = {
//     principalId: '$context.authorizer.principalId',
//     policyDocument: {
//       Version: '2012-10-17',
//       Statement: [
//         {
//           Action: 'execute-api:Invoke',
//           Effect: effect,
//           Resource: resourceArn,
//         },
//       ],
//     },
//   };

//   if (secret) {
//     return {
//       ...policy,
//       usageIdentifierKey: secret,
//     };
//   }

//   return policy;
// };
