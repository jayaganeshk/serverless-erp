export type PaymentStatus = "PAID" | "UNPAID" | "OVERDUE";

export const isPaymentStatus = (status: string): status is PaymentStatus => {
  return ["PAID", "UNPAID", "OVERDUE"].includes(status);
};

export type Invoice = {
  invoiceId: string;
  customerId: string;
  date: string; // ISO string
  dueDate: string;
  amount: number;
  paymentStatus: PaymentStatus;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export type InvoiceInput = {
  customerId: string;
  date: string; // ISO string
  dueDate: string;
  amount: number;
  paymentStatus: PaymentStatus;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export type PaymentStatusInput = {
  paymentStatus: PaymentStatus;
};

export function validateInvoiceInput(invoice: InvoiceInput): string[] {
  const errors: string[] = [];

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
