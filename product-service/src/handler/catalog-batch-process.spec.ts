import { Context, SQSEvent, SQSRecord } from 'aws-lambda';
import { SNS } from 'aws-sdk';
import { Client } from 'pg';
import { catalogBatchProcess } from './catalog-batch-process';

jest.mock('aws-sdk');
jest.mock('pg');

const SNSMock = SNS as jest.MockedClass<typeof SNS>;
const ClientMock = Client as jest.MockedClass<typeof Client>;

const query = jest.fn().mockResolvedValue({ rows: [{ count: 123 }] }) as jest.MockedFunction<typeof Client.prototype.query>;
const publish = jest.fn() as jest.MockedFunction<typeof SNSMock.prototype.publish>;

describe('catalogBatchProcess', () => {
  beforeEach(() => {
    SNSMock.mockClear();
    ClientMock.mockClear();
    ClientMock.prototype.query = query;
    SNSMock.prototype.publish = publish;
  });

  test('catalogBatchProcess parses event records, creates products and send SNS notifications', async () => {
    const event: SQSEvent = {
      Records: [
        createRecord({
          body:
            '{"title":"CSV5","description":"CSV5","price":"115","count":"5","country":"New Zealand","color":"green","image":"https://placeimg.com/640/480?4302"}',
        }),
      ],
    };

    await catalogBatchProcess(event, {} as Context, () => {});

    expect(ClientMock).toHaveBeenCalledTimes(1);
    expect(SNSMock).toHaveBeenCalledTimes(1);

    expect(ClientMock.prototype.connect).toHaveBeenCalled();
    expect(ClientMock.prototype.query).toHaveBeenCalled();
    expect(ClientMock.prototype.end).toHaveBeenCalled();
    expect(SNSMock.prototype.publish).toHaveBeenCalled();
  });
});

export const createRecord = ({ body = '', messageAttributes = {} }: Partial<SQSRecord>): SQSRecord =>
  ({
    body,
    messageAttributes,
  } as SQSRecord);
