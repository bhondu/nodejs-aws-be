import { APIGatewayProxyResult, Context } from 'aws-lambda';
import 'source-map-support/register';
import { createMockEvent } from '../util/test-util';
import { Product } from '../model/product';
import { getProductListAvailable } from './get-product-list-available';

test('getProductListAvailable should return 200 and return a list of 9 products with non-zero count', async () => {
  const event = createMockEvent({ path: 'product' });
  const response = <APIGatewayProxyResult>await getProductListAvailable(event, {} as Context, () => {});
  expect(response).not.toBeNull();
  expect(response.statusCode).toBe(200);
  expect(response.body).not.toBeNull();
  const body: Product[] = JSON.parse(response.body);
  expect(body.length).toBe(9);
  expect(body.some(p => p.count === 0)).toBe(false);
});
