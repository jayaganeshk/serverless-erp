import { APIGatewayProxyHandler } from "aws-lambda";

import { getInvoices } from "../service/invoice";

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
