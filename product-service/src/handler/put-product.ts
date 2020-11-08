import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { cors, handleError, json } from '../util/response';
import { Client } from 'pg';
import { pgClientConfig } from '../pg/util';
import { createProducts, createStocks, updateProduct } from '../pg/sql';
import { Product, productSchema } from '../model/product';
import { createProductMock } from '../util/product-mock';
import { ValidationResult } from 'joi';

export const putProduct: APIGatewayProxyHandler = async event =>
  handleError(async () => {
    console.log('Incoming event', event);

    const product: Product = JSON.parse(event?.body || '');
    let updatedProduct: Product;
    console.log('product', product);

    const validationResult: ValidationResult = productSchema.validate(product);
    console.log('validationResult', validationResult);

    if (validationResult.error) {
      return {
        statusCode: 400,
        headers: {
          ...cors(event),
          'Content-Type': 'text/html',
        },
        body: json(validationResult.error),
      };
    }

    const { country, color, image } = createProductMock();
    product.country = country;
    product.color = color;
    product.image = image;

    const client = new Client(pgClientConfig);

    await client.connect();

    try {
      let result;

      await client.query('BEGIN');

      if (product.id) {
        result = await client.query(updateProduct(product));
      } else {
        result = await client.query(createProducts([product]));
      }
      updatedProduct = result.rows[0];
      updatedProduct.count = product.count;

      await client.query(createStocks([updatedProduct]));
      console.log(updatedProduct);

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      await client.end();
    }

    return {
      statusCode: 200,
      headers: cors(event),
      body: json(updatedProduct),
    };
  });
