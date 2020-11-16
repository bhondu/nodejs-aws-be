import { APIGatewayProxyResult } from 'aws-lambda';

export const cors = () => ({
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,PUT,GET',
  'Access-Control-Allow-Credentials': true,
});

export const json = (result: unknown) => JSON.stringify(result, null, 2);

export const handleError = async (cb: () => APIGatewayProxyResult | Promise<APIGatewayProxyResult>) => {
  try {
    return await cb();
  } catch (error) {
    console.log('caught error', error);
    return Promise.resolve({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      body: JSON.stringify(error),
      stackTrace: error.stack,
    });
  }
};
