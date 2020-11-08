import { Client } from 'pg';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { handleError } from '../util/response';
import { createProducts, createProductsTable, createStocks, createStocksTable, getProducts, getProductsWithStocks } from './sql';
import { fetchProducts } from '../util/product-mock';
import { pgClientConfig } from './util';

export const createDBProducts: APIGatewayProxyHandler = async event =>
  handleError(async () => {
    const client = new Client(pgClientConfig);
    await client.connect();

    try {
      const ddlResult = await client.query(createProductsTable);

      const ddlResult2 = await client.query(createStocksTable);

      const products = await fetchProducts();

      const createProductsQuery = createProducts(products);
      console.log('createProductsQuery', createProductsQuery);
      const createProductsQueryResult = await client.query(createProductsQuery);
      console.log('createProductsQueryResult', createProductsQueryResult);

      const { rows: productsFromDB } = await client.query(getProducts);
      for (let i = 0; i < productsFromDB.length; i++) {
        productsFromDB[i].count = products[i].count;
      }

      const createStocksQuery = createStocks(productsFromDB);
      console.log('createStocks(products)', createStocks(products));
      const createStocksQueryResult = await client.query(createStocksQuery);
      console.log('createStocksQueryResult', createStocksQueryResult);

      const { rows: productsWithStocksFromDB } = await client.query(getProductsWithStocks);
      console.log(productsWithStocksFromDB);
    } catch (error) {
      console.log(error);
    } finally {
      await client.end();
    }

    return {
      statusCode: 200,
      body: '',
    };
  });
