import { APIGatewayProxyResult, Context } from 'aws-lambda';
import * as awsMock from 'aws-sdk-mock';

import { createMockEvent } from '../util/test-util';
import { importProductsFile } from './import-products-file';

describe('importProductsFile', () => {
  test('importProductsFile returns correct url', async () => {
    const url = 'https://test.url';
    awsMock.mock('S3', 'getSignedUrl', (_operation: string, _params: unknown, callback: (err: unknown, data: unknown) => void) => {
      callback(null, url);
    });

    const event = createMockEvent({ queryStringParameters: { name: 'file.csv' } });
    const importProductAnswer = (await importProductsFile(event, {} as Context, () => {})) as APIGatewayProxyResult;
    expect(importProductAnswer.body).toBe(url);
  });
});
