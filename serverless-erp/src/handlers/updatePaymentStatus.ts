import { APIGatewayProxyHandler } from "aws-lambda";

import { updatePaymentStatus } from "../service/invoice";

export const handler: APIGatewayProxyHandler = async (event) => {
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
  await updatePaymentStatus(invoiceId, paymentStatus);
  return {
    statusCode: 200,
    body: JSON.stringify({ invoiceId }),
  };
};
