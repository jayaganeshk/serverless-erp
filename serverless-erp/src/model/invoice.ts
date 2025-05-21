export type Invoice = {
  invoiceId: string;
  customerId: string;
  date: string; // ISO string
  dueDate: string;
  amount: number;
  paymentStatus: "PAID" | "UNPAID" | "OVERDUE";
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export type InvoiceDDB = {
  PK: "INVOICE";
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

export function validateInvoice(invoice: Invoice): string[] {
  const errors: string[] = [];

  if (!invoice.invoiceId) errors.push("invoiceId is required");
  if (!invoice.customerId) errors.push("customerId is required");
  if (!invoice.date) errors.push("date is required");
  if (!invoice.dueDate) errors.push("dueDate is required");
  if (typeof invoice.amount !== "number")
    errors.push("amount must be a number");
  if (!["PAID", "UNPAID", "OVERDUE"].includes(invoice.paymentStatus))
    errors.push("paymentStatus must be PAID, UNPAID, or OVERDUE");

  if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
    errors.push("At least one item is required");
  } else {
    invoice.items.forEach((item, index) => {
      if (!item.description)
        errors.push(`items[${index}].description is required`);
      if (typeof item.quantity !== "number")
        errors.push(`items[${index}].quantity must be a number`);
      if (typeof item.unitPrice !== "number")
        errors.push(`items[${index}].unitPrice must be a number`);
    });
  }

  return errors;
}

export function toDDB(invoice: Invoice): InvoiceDDB {
  return {
    PK: "INVOICE",
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
    paymentStatus: item.paymentStatus as "PAID" | "UNPAID" | "OVERDUE",
    items: item.items,
  };
}
