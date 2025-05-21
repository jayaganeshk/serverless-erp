import { documentClient } from "../utils/ddbClient";

import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const TableName = process.env.DDB_TABLE_NAME!;

const INVOICE_PREFIX = "INV-";

export const newInvoiceNumber = async () => {
  const params = {
    TableName: process.env.DDB_TABLE_NAME,
    Key: {
      PK: "GAP_LESS_INVOICE_NUMBER",
      SK: "GAP_LESS_INVOICE_NUMBER",
    },
    UpdateExpression:
      "SET invoiceNumber = if_not_exists(invoiceNumber, :zero) + :incr",
    ExpressionAttributeValues: {
      ":incr": 1,
      ":zero": 0,
    },
    ReturnValues: "UPDATED_NEW" as const,
  };
  const result = await documentClient.update(params);
  if (!result.Attributes) {
    throw new Error("Failed to retrieve new OrderID");
  }
  return `${INVOICE_PREFIX}${result.Attributes.invoiceNumber}`;
};
