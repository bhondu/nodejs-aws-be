import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent, Context } from 'aws-lambda';
import { basicAuthorizer } from './basic-authorizer';

describe('basicAuthorizer', () => {
  test('basicAuthorizer returns Allow policy for password stored in .env', async () => {
    const authorizationToken = Buffer.from('bhondu:TEST_PASSWORD').toString('base64');
    console.log(authorizationToken);
    const event = {
      type: 'TOKEN',
      methodArn: 'arn',
      authorizationToken: `Basic ${authorizationToken}`,
    } as APIGatewayTokenAuthorizerEvent;

    const basicAuthorizerResult = (await basicAuthorizer(event, {} as Context, () => {})) as APIGatewayAuthorizerResult;
    expect(basicAuthorizerResult.policyDocument.Statement[0]).toMatchObject({ Effect: 'Allow' });
  });

  test('basicAuthorizer returns Deny policy for wrong password', async () => {
    const authorizationToken = Buffer.from('bhondu:INVALID_PASSWORD').toString('base64');
    console.log(authorizationToken);
    const event = {
      type: 'TOKEN',
      methodArn: 'arn',
      authorizationToken: `Basic ${authorizationToken}`,
    } as APIGatewayTokenAuthorizerEvent;

    const basicAuthorizerResult = (await basicAuthorizer(event, {} as Context, () => {})) as APIGatewayAuthorizerResult;
    expect(basicAuthorizerResult.policyDocument.Statement[0]).toMatchObject({ Effect: 'Deny' });
  });

  test('basicAuthorizer throws `Unauthorized` for unknown token type', async () => {
    const authorizationToken = Buffer.from('bhondu:TEST_PASSWORD').toString('base64');
    console.log(authorizationToken);
    const event = {
      type: 'REQUEST' as 'TOKEN',
      methodArn: 'arn',
      authorizationToken: `Basic ${authorizationToken}`,
    } as APIGatewayTokenAuthorizerEvent;

    try {
      await basicAuthorizer(event, {} as Context, () => {});
    } catch (e) {
      expect(e).toMatch(/Unauthorized/);
    }
  });

  test('basicAuthorizer throws `Unauthorized` when invoked without token', async () => {
    const event = {
      type: 'TOKEN',
      methodArn: 'arn',
      authorizationToken: 'Basic',
    } as APIGatewayTokenAuthorizerEvent;

    try {
      await basicAuthorizer(event, {} as Context, () => {});
    } catch (e) {
      expect(e).toMatch(/Unauthorized/);
    }
  });

  test('basicAuthorizer throws `Unauthorized` when invoked without authorization header', async () => {
    const event = {
      type: 'TOKEN',
      methodArn: 'arn',
      authorizationToken: '',
    } as APIGatewayTokenAuthorizerEvent;

    try {
      await basicAuthorizer(event, {} as Context, () => {});
    } catch (e) {
      expect(e).toMatch(/Unauthorized/);
    }
  });
});
