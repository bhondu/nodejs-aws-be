import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { cors, handleError, json } from '../util/response';
import { Client } from 'pg';
import { pgClientConfig } from '../pg/util';
import { getProductWithStocksById } from '../pg/sql';
import { Product } from 'src/model/product';

export const getProductById: APIGatewayProxyHandler = async event =>
  handleError(async () => {
    console.log('Incoming event', event);

    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 401,
        headers: {
          ...cors(event),
          'Content-Type': 'text/html',
        },
        body: 'Product id is required',
      };
    }

    let product: Product;
    const client = new Client(pgClientConfig);

    await client.connect();

    try {
      const { rows } = await client.query(getProductWithStocksById(id));
      product = rows[0];
      console.log(product);
    } finally {
      await client.end();
    }

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
