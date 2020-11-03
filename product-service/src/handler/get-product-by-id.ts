import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { fetchProducts } from '../util/product-mock';
import { cors, handleError, json } from '../util/response';

export const getProductById: APIGatewayProxyHandler = async event =>
  handleError(async () => {
    const id = event.pathParameters?.id;
    const products = await fetchProducts();
    const product = products.find(p => p.id === id);

    if (!product) {
      return {
        statusCode: 404,
        headers: {
          ...cors(event),
          'Content-Type': 'text/html',
        },
        body: `Product ${id} not found`,
      };
    }

    return {
      statusCode: 200,
      headers: cors(event),
      body: json(product),
    };
  });
