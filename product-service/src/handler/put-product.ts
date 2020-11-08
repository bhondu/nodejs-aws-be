import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { cors, handleError, json } from '../util/response';
import { Client } from 'pg';
import { pgClientConfig } from '../pg/util';
import { createProducts, updateProduct } from '../pg/sql';
import { Product, productSchema } from '../model/product';
import { createProductMock } from '../util/product-mock';
import { ValidationResult } from 'joi';

export const putProduct: APIGatewayProxyHandler = async event =>
  handleError(async () => {
    console.log('Incoming event', event);

    const product: Product = JSON.parse(event?.body || '');
    let updatedProduct: Product;

    const validationResult: ValidationResult = productSchema.validate(product);

    if (validationResult.errors) {
      return {
        statusCode: 401,
        headers: {
          ...cors(event),
          'Content-Type': 'text/html',
        },
        body: json(validationResult),
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
      if (product.id) {
        result = await client.query(updateProduct(product));
      } else {
        result = await client.query(createProducts([product]));
      }
      updatedProduct = result.rows[0];
      console.log(product);
    } finally {
      await client.end();
    }

    return {
      statusCode: 200,
      headers: cors(event),
      body: json(updatedProduct),
    };
  });
