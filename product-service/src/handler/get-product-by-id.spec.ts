import { APIGatewayProxyResult, Context } from 'aws-lambda';
import 'source-map-support/register';
import { getProductById } from './get-product-by-id';
import { createMockEvent } from '../util/test-util';
import { fetchProducts } from '../util/product-mock';

jest.mock('../util/product-mock');
const { fetchProducts: fetchProductsActual } = jest.requireActual('../util/product-mock');

describe('getProductById', () => {
  const ctx = <Context>{};
  const cb = () => {};

  beforeEach(() => (<jest.Mock>fetchProducts).mockImplementation(() => fetchProductsActual()));

  test('should return 404 for non-existing product id', async () => {
    const event = createMockEvent({ path: 'product', pathParameters: { id: '123' } });
    const response = <APIGatewayProxyResult>await getProductById(event, ctx, cb);
    expect(response).not.toBeNull();
    expect(response.statusCode).toBe(404);
  });

  test('should return 500 for failure', async () => {
    (<jest.Mock>fetchProducts).mockImplementation(() => {
      throw new Error('failure');
    });

    const event = createMockEvent({ pathParameters: undefined });
    const response = <APIGatewayProxyResult>await getProductById(event, ctx, cb);
    expect(response).not.toBeNull();
    expect(response.statusCode).toBe(500);
  });

  test('should return 200 and return a product with id', async () => {
    const id = '1ad3d9ee-2117-42b6-96d8-61737c57ecd0';
    const event = createMockEvent({ path: 'product', pathParameters: { id } });
    const response = <APIGatewayProxyResult>await getProductById(event, ctx, cb);
    expect(response).not.toBeNull();
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toBeNull();
    expect(JSON.parse(response.body)).toMatchObject({ id });
  });
});
