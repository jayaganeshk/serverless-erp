import { APIGatewayProxyHandler } from "aws-lambda";

import { getInvoice } from "../service/invoice";

export const handler: APIGatewayProxyHandler = async (event) => {
  const { invoiceId } = event.pathParameters || {};
  if (!invoiceId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "invoiceId is required" }),
    };
  }
  const result = await getInvoice(invoiceId);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
