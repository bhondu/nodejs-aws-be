import { Client } from 'pg';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { handleError } from '../util/response';
import { pgClientConfig } from './util';

export const pgClient: APIGatewayProxyHandler = async event =>
  handleError(async () => {
    const client = new Client(pgClientConfig);
    await client.connect();

    try {
      const ddlResult = await client.query(`
      create table if not exists todo_list (
        id serial primary key,
        list_name text,
        list_description text
      )`);

      const ddlResult2 = await client.query(`
      create table if not exists todo_item(
        id serial primary key,
        list_id integer,
        item_name text,
        item_description text,
        foreign key ("list_id") references "todo_list" ("id")
      )`);

      const dmlResult = await client.query(`
      insert into todo_list (list_name, list_description) values
        ('Important', 'Imp desc'),
        ('Secondary', 'Sec desc')
      `);

      const dmlResult2 = await client.query(`
      insert into todo_item (list_id, item_name, item_description) values
        (1, 'Learn Lambda', 'Lambda desc'),
        (1, 'Learn RDS', 'RDS desc'),
        (1, 'Learn EC2', 'EC2 desc'),
        (2, 'Learn IDE shortcuts', 'IDE shortcuts desc'),
        (2, 'Learn DBeaver', 'DBeaver desc')
      `);

      const { rows: todoItems } = await client.query('select * from todo_item');
      console.log(todoItems);
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
