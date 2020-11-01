import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIGatewayEventRequestContextWithAuthorizer } from 'aws-lambda/common/api-gateway';

export const eventMockDefaults: APIGatewayProxyEvent = {
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  path: '',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<{}>,
  resource: '',
};

export const createMockEvent = (event: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent => ({
  ...eventMockDefaults,
  ...event,
});
