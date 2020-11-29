import type { Serverless } from 'serverless/aws';

import { Bucket, catalogItemsQueue, folderUploaded } from './src/const/const';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      // includeModules: true,
      includeModules: {
        forceExclude: 'aws-sdk',
      },
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
        Action: 's3:ListBucket',
        Resource: [`arn:aws:s3:::${Bucket}`],
      },
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: [`arn:aws:s3:::${Bucket}/*`],
      },
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: `\${cf:product-service-dev.${catalogItemsQueue}Arn}`,
      },
    ],
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      [catalogItemsQueue]: `\${cf:product-service-dev.${catalogItemsQueue}}`,
      [catalogItemsQueue + 'Arn']: `\${cf:product-service-dev.${catalogItemsQueue}Arn}`,
    },
  },
  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            cors: true,
            request: {
              parameters: {
                querystrings: {
                  name: true,
                },
              },
            },
          },
        },
      ],
    },
    importFileParser: {
      handler: 'handler.importFileParser',
      events: [
        {
          s3: {
            bucket: Bucket,
            event: 's3:ObjectCreated:*',
            rules: [
              {
                prefix: folderUploaded,
                suffix: '',
              },
            ],
            existing: true,
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
