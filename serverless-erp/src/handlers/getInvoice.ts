import { APIGatewayProxyHandler } from "aws-lambda";

import {
  Invoice,
  InvoiceDDB,
  validateInvoice,
  fromDDB,
  toDDB,
} from "../model/invoice";

import { getInvoices } from "../service/invoice";

import { documentClient } from "../utils/ddbClient";

const TableName = process.env.DDB_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const { customerId, paymentStatus, date, limit, nextToken } =
    event.queryStringParameters || {};

  const result = await getInvoices(
    customerId,
    paymentStatus,
    date,
    Number(limit || 10),
    nextToken
  );

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
