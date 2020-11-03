import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { fetchProducts } from '../util/product-mock';
import { cors, handleError, json } from '../util/response';

export const getProductList: APIGatewayProxyHandler = async event =>
  handleError(async () => {
    const products = await fetchProducts();

    return {
      statusCode: 200,
      headers: cors(event),
      body: json(products),
    };
  });
