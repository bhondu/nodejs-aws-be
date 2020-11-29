import type { Serverless } from 'serverless/aws';
import { catalogItemsQueue, createExpensiveProductTopic, createProductTopic } from './src/const/const';

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
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: {
          'Fn::GetAtt': [catalogItemsQueue, 'Arn'],
        },
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: {
          Ref: createProductTopic,
        },
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: {
          Ref: createExpensiveProductTopic,
        },
      },
    ],
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
      [catalogItemsQueue]: {
        Ref: catalogItemsQueue,
      },
      [createProductTopic]: {
        Ref: createProductTopic,
      },
      [createExpensiveProductTopic]: {
        Ref: createExpensiveProductTopic,
      },
    },
  },
  resources: {
    Resources: {
      [catalogItemsQueue]: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: catalogItemsQueue,
        },
      },
      [createProductTopic]: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: createProductTopic,
        },
      },
      [createExpensiveProductTopic]: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: createExpensiveProductTopic,
        },
      },
      SNSSubscription1: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: `1031111+${createProductTopic}@gmail.com`,
          Protocol: 'email',
          TopicArn: {
            Ref: createProductTopic,
          },
          FilterPolicy: { price: [{ numeric: ['<', 100] }] },
        },
      },
      SNSSubscription2: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: `1031111+${createExpensiveProductTopic}@gmail.com`,
          Protocol: 'email',
          TopicArn: {
            Ref: createExpensiveProductTopic,
          },
          FilterPolicy: { price: [{ numeric: ['>=', 100] }] },
        },
      },
    },
    Outputs: {
      [catalogItemsQueue]: {
        Export: { Name: catalogItemsQueue },
        Value: {
          Ref: catalogItemsQueue,
        },
      },
      [catalogItemsQueue + 'Arn']: {
        Export: { Name: catalogItemsQueue + 'Arn' },
        Value: {
          'Fn::GetAtt': [catalogItemsQueue, 'Arn'],
        },
      },
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
    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {
              'Fn::GetAtt': [catalogItemsQueue, 'Arn'],
            },
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
