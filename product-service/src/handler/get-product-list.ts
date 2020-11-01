import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { fetchProducts } from '../util/product-mock';
import { cors, handleError } from '../util/response';

export const getProductList: APIGatewayProxyHandler = async event => {
  return handleError(async () => {
    console.log('event', JSON.stringify(event));

    const products = await fetchProducts();

    return {
      statusCode: 200,
      headers: cors(event),
      body: JSON.stringify(products, null, 2),
    };
  });
};
