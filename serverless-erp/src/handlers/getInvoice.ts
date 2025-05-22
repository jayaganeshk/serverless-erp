import { APIGatewayProxyHandler } from "aws-lambda";

import { getInvoice } from "../service/invoice";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { invoiceId } = event.pathParameters || {};
    if (!invoiceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "invoiceId is required" }),
      };
    }
    const result = await getInvoice(invoiceId);
    if (!result) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Invoice not found" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
