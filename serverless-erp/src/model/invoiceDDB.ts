import { Invoice, PaymentStatus } from "./invoice";

export type InvoiceDDB = {
  PK: string; // <invoiceId>
  SK: string; // <invoiceDate>
  entityType: "INVOICE";
  invoiceId: string;
  customerId: string;
  date: string;
  dueDate: string;
  amount: number;
  paymentStatus: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export function toDDB(invoice: Invoice): InvoiceDDB {
  return {
    PK: invoice.invoiceId,
    SK: invoice.date,
    entityType: "INVOICE",
    invoiceId: invoice.invoiceId,
    customerId: invoice.customerId,
    date: invoice.date,
    dueDate: invoice.dueDate,
    amount: invoice.amount,
    paymentStatus: invoice.paymentStatus,
    items: invoice.items,
  };
}

export function fromDDB(item: InvoiceDDB): Invoice {
  return {
    invoiceId: item.invoiceId,
    customerId: item.customerId,
    date: item.date,
    dueDate: item.dueDate,
    amount: item.amount,
    paymentStatus: item.paymentStatus as PaymentStatus,
    items: item.items,
  };
}
