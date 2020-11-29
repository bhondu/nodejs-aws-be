import { SQSHandler } from 'aws-lambda';
import { ValidationResult } from 'joi';
import { Client } from 'pg';
import { SNS } from 'aws-sdk';
import 'source-map-support/register';
import { region, createProductTopic, createExpensiveProductTopic } from '../const/const';
import { Product, productSchema } from '../model/product';
import { createProducts, createStocks, updateProduct } from '../pg/sql';
import { pgClientConfig } from '../pg/util';
import { createProductMock } from '../util/product-mock';

export const catalogBatchProcess: SQSHandler = async event => {
  console.log(`Incoming event [${event?.Records?.length} Record(s)]`, event);
  let incomingProducts: Product[] = [];
  const products: Product[] = [];

  try {
    incomingProducts = event.Records.map(({ body }) => JSON.parse(body));
  } catch (err) {
    console.log('Error while parsing incomingProducts batch:', err);
  }
  console.log('incomingProducts', incomingProducts);

  for (const product of incomingProducts) {
    const validationResult: ValidationResult = productSchema.validate(product);
    if (validationResult.error) {
      console.log('Skipping invalid product:', product, validationResult.error);
      continue;
    }
    const { country, color, image } = createProductMock();
    product.country = country;
    product.color = color;
    product.image = image;
    products.push(product);
  }

  const client = new Client(pgClientConfig);
  const sns = new SNS({ region });
  console.log('createProductTopic', process.env[createProductTopic]);
  console.log('createExpensiveProductTopic', process.env[createExpensiveProductTopic]);

  await client.connect();

  for (const product of products) {
    try {
      let result;

      await client.query('BEGIN');

      if (product.id) {
        result = await client.query(updateProduct(product));
      } else {
        result = await client.query(createProducts([product]));
      }
      const updatedProduct = result.rows[0];
      updatedProduct.count = product.count;

      await client.query(createStocks([updatedProduct]));
      console.log(updatedProduct);

      await client.query('COMMIT');

      notify(sns, <string>process.env[createProductTopic], updatedProduct);
      notify(sns, <string>process.env[createExpensiveProductTopic], updatedProduct);
    } catch (e) {
      await client.query('ROLLBACK');
    }
  }

  await client.end();
};

export function notify(sns: SNS, topic: string, product: Product) {
  sns.publish(
    {
      Subject: `A new product was added ($${product.price})`,
      Message: JSON.stringify(product),
      TopicArn: topic,
      MessageAttributes: {
        price: {
          DataType: 'Number',
          StringValue: product.price?.toString(),
        },
      },
    },
    (err, data) => {
      if (err) {
        console.log('SNS Email error:', err);
      } else {
        console.log('SNS EMail sent:', data);
      }
    },
  );
}
