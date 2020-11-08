import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { fetchProducts } from '../util/product-mock';
import { cors, handleError, json } from '../util/response';

export const getProductListAvailable: APIGatewayProxyHandler = async event =>
  handleError(async () => {
    const products = await fetchProducts();
    const availableProducts = products.filter(p => p.count);

    return {
      statusCode: 200,
      headers: cors(event),
      body: json(availableProducts),
    };
  });
