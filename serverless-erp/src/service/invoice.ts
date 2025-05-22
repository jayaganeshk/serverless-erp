import { documentClient } from "../utils/ddbClient";
import {
  Invoice,
  InvoiceDDB,
  fromDDB,
  toDDB,
  InvoiceInput,
  isPaymentStatus,
} from "../model/invoice";
import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";

import { newInvoiceNumber } from "./invoiceNumber";

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

  // Case 1: Query by customerId using entityTypeCustomerIdIndex
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

  // Case 2: Query by paymentStatus only using entityTypePaymentStatusIndex
  else if (paymentStatus) {
    params.IndexName = "entityTypePaymentStatusIndex";
    params.KeyConditionExpression =
      "entityType = :entityType AND paymentStatus = :paymentStatus";
    params.ExpressionAttributeValues![":paymentStatus"] = paymentStatus;
  }

  // Case 3: Fetch all invoices using entityTypeSKIndex
  else {
    params.IndexName = "entityTypeSKIndex";
    params.KeyConditionExpression = "entityType = :entityType";

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

export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  const params = {
    TableName,
    KeyConditionExpression: "PK = :invoiceId",
    ExpressionAttributeValues: {
      ":invoiceId": invoiceId,
    },
  };

  const result = await documentClient.query(params);
  if (result.Items && result.Items.length > 0) {
    return fromDDB(result.Items[0] as InvoiceDDB);
  }
  return null;
}

export async function createInvoice(
  invoiceInput: InvoiceInput
): Promise<String> {
  const invoiceNumber = await newInvoiceNumber();

  const invoice = toDDB({
    ...invoiceInput,
    invoiceId: invoiceNumber,
  });
  const params = {
    TableName,
    Item: invoice,
  };

  await documentClient.put(params);

  return invoiceNumber;
}

export async function updatePaymentStatus(
  invoiceId: string,
  paymentStatus: string
): Promise<void> {
  // validate if paymentStatus is of isPaymentStatus
  if (!isPaymentStatus(paymentStatus)) {
    throw new Error("Invalid payment status");
  }

  // query and get invoice date
  const invoice = await getInvoice(invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  console.log("invoice", invoice);

  const params = {
    TableName,
    Key: {
      PK: invoiceId,
      SK: invoice.date,
    },
    UpdateExpression: "SET paymentStatus = :paymentStatus",
    ExpressionAttributeValues: {
      ":paymentStatus": paymentStatus,
    },
  };

  await documentClient.update(params);
}
