import { APIGatewayProxyHandler } from "aws-lambda";

import { updatePaymentStatus, getInvoice } from "../service/invoice";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { invoiceId } = event.pathParameters || {};
    if (!invoiceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "invoiceId is required" }),
      };
    }

    const { body } = event;
    //   validate the request body
    if (!body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "body is required" }),
      };
    }
    const { paymentStatus } = JSON.parse(body);

    // validate if invoice is already present
    const invoice = await getInvoice(invoiceId);

    if (!invoice) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Invoice not found" }),
      };
    }

    await updatePaymentStatus(invoiceId, paymentStatus);
    return {
      statusCode: 200,
      body: JSON.stringify({ invoiceId }),
    };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
