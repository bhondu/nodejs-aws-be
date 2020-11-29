import { S3Handler } from 'aws-lambda';
import { S3, SQS } from 'aws-sdk';
import * as csv from 'csv-parser';
import 'source-map-support/register';

import { Bucket, catalogItemsQueue, folderParsed, folderUploaded, region } from '../const/const';

export const importFileParser: S3Handler = async event => {
  console.log(`Incoming event [${event?.Records?.length} Record(s)]`, event);

  const s3 = new S3({ region });

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

      // create sqs
      const sqs = new SQS();
      console.log('catalogItemsQueue', process.env[catalogItemsQueue]);

      await new Promise((resolve, reject) => {
        s3ObjectStream
          .pipe(csv())
          .on('data', data => {
            if (!data.id) {
              delete data.id;
            }
            console.log('On data', data);
            sqs.sendMessage(
              {
                QueueUrl: <string>process.env[catalogItemsQueue],
                MessageBody: JSON.stringify(data),
              },
              (err, data) => {
                if (err) {
                  console.log('Message error:', err);
                } else {
                  console.log('Message sent:', data);
                }
              },
            );
          })
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
