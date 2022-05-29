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
