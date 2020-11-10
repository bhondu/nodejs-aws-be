import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'eu-west-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      DB_HOST: '${env:DB_HOST}',
      DB_PORT: '${env:DB_PORT}',
      DB_NAME: '${env:DB_NAME}',
      DB_USERNAME: '${env:DB_USERNAME}',
      DB_PASSWORD: '${env:DB_PASSWORD}',
    },
  },
  functions: {
    getProductList: {
      handler: 'handler.getProductList',
      events: [
        {
          http: {
            method: 'get',
            path: 'product',
            cors: true,
          },
        },
      ],
    },
    getProductListAvailable: {
      handler: 'handler.getProductListAvailable',
      events: [
        {
          http: {
            method: 'get',
            path: 'product/available',
            cors: true,
          },
        },
      ],
    },
    getProductById: {
      handler: 'handler.getProductById',
      events: [
        {
          http: {
            method: 'get',
            path: 'product/{id}',
            cors: true,
          },
        },
      ],
    },
    putProduct: {
      handler: 'handler.putProduct',
      events: [
        {
          http: {
            method: 'put',
            path: 'product',
            cors: true,
          },
        },
      ],
    },
    pgClient: {
      handler: 'handler.pgClient',
    },
    createDBProducts: {
      handler: 'handler.createDBProducts',
    },
  },
};

module.exports = serverlessConfiguration;
