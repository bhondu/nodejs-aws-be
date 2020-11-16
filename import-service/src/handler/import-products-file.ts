import { APIGatewayProxyHandler } from 'aws-lambda';
import * as aws from 'aws-sdk';
import 'source-map-support/register';

import { Bucket, folderUploaded, region } from '../const/const';
import { cors, handleError } from '../util/response';

export const importProductsFile: APIGatewayProxyHandler = async event =>
  handleError(async () => {
    console.log('Incoming event', event);

    const folderName = event.queryStringParameters?.name;
    const folderPath = folderUploaded + folderName;

    const s3 = new aws.S3({ region });

    const parameters = {
      Bucket,
      Key: folderPath,
      Expires: 60,
      ContentType: 'text/csv',
    };

    return new Promise((resolve, reject) => {
      s3.getSignedUrl('putObject', parameters, (error, url) => {
        if (error) {
          return reject(error);
        }

        resolve({
          statusCode: 200,
          headers: cors(),
          body: url,
        });
      });
    });
  });
