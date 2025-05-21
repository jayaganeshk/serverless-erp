import { documentClient } from "../utils/ddbClient";
import { Invoice, InvoiceDDB, fromDDB } from "../model/invoice";
import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const TableName = process.env.DDB_TABLE_NAME!;

export async function getInvoices(
  customerId?: string,
  paymentStatus?: string,
  date?: string,
  limit: number = 10,
  nextToken?: string
): Promise<{ invoices: Invoice[]; nextToken?: string }> {
  let params: QueryCommandInput = {
    TableName,
    Limit: limit,
    ExpressionAttributeValues: {
      ":entityType": "INVOICE",
    },
  };

  if (nextToken) {
    params.ExclusiveStartKey = JSON.parse(
      Buffer.from(nextToken, "base64").toString("utf-8")
    );
  }

  // Case 1: Query by customerId using GSI
  if (customerId) {
    params.IndexName = "entityTypeCustomerIdIndex";
    params.KeyConditionExpression =
      "entityType = :entityType AND customerId = :customerId";
    params.ExpressionAttributeValues![":customerId"] = customerId;

    // Optional filter
    const filters: string[] = [];
    params.ExpressionAttributeNames = {};

    if (paymentStatus) {
      filters.push("#paymentStatus = :paymentStatus");
      params.ExpressionAttributeNames!["#paymentStatus"] = "paymentStatus";
      params.ExpressionAttributeValues![":paymentStatus"] = paymentStatus;
    }

    if (date) {
      filters.push("#date = :date");
      params.ExpressionAttributeNames!["#date"] = "date";
      params.ExpressionAttributeValues![":date"] = date;
    }

    if (filters.length > 0) {
      params.FilterExpression = filters.join(" AND ");
    }
  }

  // Case 2: Query by paymentStatus only using GSI
  else if (paymentStatus) {
    params.IndexName = "entityTypePaymentStatusIndex";
    params.KeyConditionExpression =
      "entityType = :entityType AND paymentStatus = :paymentStatus";
    params.ExpressionAttributeValues![":paymentStatus"] = paymentStatus;
  }

  // Case 3: Fetch all invoices (assumes you have a GSI like entityType-SK-index)
  else {
    params.KeyConditionExpression = "PK = :entityType";

    if (date) {
      params.FilterExpression = "#date = :date";
      params.ExpressionAttributeNames = { "#date": "SK" };
      params.ExpressionAttributeValues![":date"] = date;
    }
  }

  const result = await documentClient.query(params);
  const invoices = result.Items as InvoiceDDB[];

  return {
    invoices: invoices.map(fromDDB),
    nextToken: result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
      : undefined,
  };
}
