import { ClientConfig } from 'pg';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;
export const pgClientConfig: ClientConfig = {
  host: PG_HOST,
  port: PG_PORT ? parseInt(PG_PORT) : 5432,
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 500,
};
