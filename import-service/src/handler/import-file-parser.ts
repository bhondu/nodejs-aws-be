import { S3Handler } from 'aws-lambda';
import * as aws from 'aws-sdk';
import * as csv from 'csv-parser';
import 'source-map-support/register';

import { Bucket, folderParsed, folderUploaded, region } from '../const/const';

export const importFileParser: S3Handler = async event => {
  console.log('Incoming event', event);

  const s3 = new aws.S3({ region });

  for (const record of event.Records) {
    console.log('Record', record);

    const sourceObjectKey = record.s3.object.key;
    const sourceBucketPath = `${Bucket}/${sourceObjectKey}`;
    const destinationKey = sourceObjectKey.replace(folderUploaded, folderParsed);
    console.log(`Copy ${sourceBucketPath} to ${Bucket}/${destinationKey}`);

    try {
      // create read stream
      const s3ObjectStream = s3
        .getObject({
          Bucket,
          Key: sourceObjectKey,
        })
        .createReadStream();

      await new Promise((resolve, reject) => {
        s3ObjectStream
          .pipe(csv())
          .on('data', data => console.log('On data', data))
          .on('end', async () => {
            console.log('On end');

            // copy file
            await s3
              .copyObject({
                Bucket,
                CopySource: sourceBucketPath,
                Key: destinationKey,
              })
              .promise();

            // delete source file
            await s3
              .deleteObject({
                Bucket,
                Key: sourceObjectKey,
              })
              .promise();

            console.log('Done ok');
            resolve();
          })
          .on('error', error => {
            console.log('Object stream error');
            reject(error);
          });
      });
    } catch (error) {
      console.log('Unknown error', error);
    }
  }
};
