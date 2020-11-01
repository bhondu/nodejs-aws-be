import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { fetchProducts } from '../util/product-mock';
import { cors, handleError } from '../util/response';

export const getProductListAvailable: APIGatewayProxyHandler = async event => {
  return handleError(async () => {
    console.log('event', JSON.stringify(event));

    const products = await fetchProducts();
    const availableProducts = products.filter(p => p.count);

    return {
      statusCode: 200,
      headers: cors(event),
      body: JSON.stringify(availableProducts, null, 2),
    };
  });
};
