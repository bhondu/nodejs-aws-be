import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const cors = (event: APIGatewayProxyEvent) => ({
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': event?.headers?.origin || '',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
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
