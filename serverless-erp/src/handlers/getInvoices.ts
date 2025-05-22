import { APIGatewayProxyHandler } from "aws-lambda";

import { getInvoices } from "../service/invoice";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
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
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
