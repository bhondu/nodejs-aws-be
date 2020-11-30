import type { Serverless } from 'serverless/aws';

import { Bucket, catalogItemsQueue, folderUploaded, region } from './src/const/const';

const getGatewayResponseConfig = (ResponseType: string) => ({
  Type: 'AWS::ApiGateway::GatewayResponse',
  Properties: {
    ResponseParameters: {
      'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
      'gatewayresponse.header.Access-Control-Allow-Credentials': "'true'",
    },
    ResponseType,
    RestApiId: {
      Ref: 'ApiGatewayRestApi',
    },
    ResponseTemplates: {
      'application/json': '{"message": $context.error.messageString}',
    },
  },
});

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
    region,
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
            authorizer: {
              name: 'basicAuthorizer',
              type: 'token',
              resultTtlInSeconds: 0,
              identityValidationExpression: '^Basic (?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$',
              identitySource: 'method.request.header.Authorization',
              arn: {
                'Fn::Join': [
                  ':',
                  [
                    'arn:aws:lambda',
                    {
                      Ref: 'AWS::Region',
                    },
                    {
                      Ref: 'AWS::AccountId',
                    },
                    'function:authorization-service-dev-basicAuthorizer',
                  ],
                ],
              } as any,
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
  resources: {
    Resources: {
      GatewayResponseDenied: getGatewayResponseConfig('ACCESS_DENIED'),
      GatewayResponseUnauthorized: getGatewayResponseConfig('UNAUTHORIZED'),
      GatewayResponseDEFAULT4XX: getGatewayResponseConfig('DEFAULT_4XX'),
      GatewayResponseDEFAULT5XX: getGatewayResponseConfig('DEFAULT_5XX'),
    },
  },
};

module.exports = serverlessConfiguration;
