import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { cors, handleError, json } from '../util/response';

export const importProductsFile: APIGatewayProxyHandler = async event =>
  handleError(async () => {
    console.log('Incoming event', event);

    return {
      statusCode: 200,
      headers: cors(event),
      body: json({ message: 'success', name: event.queryStringParameters?.name }),
    };
  });
