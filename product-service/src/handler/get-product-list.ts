import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { cors, handleError, json } from '../util/response';
import { Client } from 'pg';
import { pgClientConfig } from '../pg/util';
import { getProductsWithStocks } from '../pg/sql';

export const getProductList: APIGatewayProxyHandler = async event =>
  handleError(async () => {
    console.log('Incoming event', event);

    let products = [];
    const client = new Client(pgClientConfig);

    await client.connect();

    try {
      const { rows } = await client.query(getProductsWithStocks);
      products = rows;
      console.log(products);
    } finally {
      await client.end();
    }

    return {
      statusCode: 200,
      headers: cors(event),
      body: json(products),
    };
  });
