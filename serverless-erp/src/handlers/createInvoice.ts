import { APIGatewayProxyHandler } from "aws-lambda";

import { createInvoice } from "../service/invoice";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { body } = event;
    //   validate the request body
    if (!body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "body is required" }),
      };
    }
    const invoiceInput = JSON.parse(body);
    const invoiceId = await createInvoice(invoiceInput);
    return {
      statusCode: 200,
      body: JSON.stringify({ invoiceId }),
    };
  } catch (e) {
    console.error("Error creating invoice:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
