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
  plugins: ['serverless-webpack'],
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
      PG_HOST: 'nodejs-aws-be.cupqagybo1vs.eu-west-1.rds.amazonaws.com',
      PG_PORT: '5432',
      PG_DATABASE: 'task04',
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
