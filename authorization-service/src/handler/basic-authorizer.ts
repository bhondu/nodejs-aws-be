import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerHandler } from 'aws-lambda';
import 'source-map-support/register';

function generatePolicy(principalId: string, resource: string, effect = 'Allow'): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}

export const basicAuthorizer: APIGatewayTokenAuthorizerHandler = async event => {
  console.log('Incoming event', event);

  if (event?.type !== 'TOKEN') {
    return Promise.reject('Unauthorized');
  }

  try {
    const { authorizationToken } = event;

    const encodedCredentials = authorizationToken.split(' ')[1];
    const [username, password] = Buffer.from(encodedCredentials, 'base64').toString('utf-8').split(':');

    console.log(`username: ${username}, password: ${password}`);

    const storedPassword = process.env[username];

    const effect = !storedPassword || storedPassword !== password ? 'Deny' : 'Allow';
    const policy = generatePolicy(encodedCredentials, event.methodArn, effect);

    return Promise.resolve(policy);
  } catch (e) {
    return Promise.reject(`Unauthorized: ${e.message}`);
  }
};
