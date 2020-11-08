import { APIGatewayProxyResult, Context } from 'aws-lambda';
import 'source-map-support/register';
import { createMockEvent } from '../util/test-util';
import { getProductList } from './get-product-list';
import { Product } from '../model/product';

describe('getProductList', () => {
  test('should return 200 and return a list of 10 products', async () => {
    const event = createMockEvent({ path: 'product' });
    const response = <APIGatewayProxyResult>await getProductList(event, <Context>{}, () => {});
    expect(response).not.toBeNull();
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toBeNull();
    const body: Product[] = JSON.parse(response.body);
    expect(body.length).toBe(10);
  });
});
