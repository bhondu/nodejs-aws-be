import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { fetchProducts } from '../util/product-mock';
import { cors, handleError } from '../util/response';

export const getProductById: APIGatewayProxyHandler = async event => {
  return handleError(async () => {
    console.log('event', JSON.stringify(event));

    const id = event.pathParameters?.id;
    console.log('id', id);

    const products = await fetchProducts();

    const product = products.find(p => p.id === id);
    console.log('product', product);

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
      body: JSON.stringify(product, null, 2),
    };
  });
};
