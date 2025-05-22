import { Invoice, InvoiceInput, PaymentStatus } from "./invoice";

export type GetInvoicesResponse = {
  invoices: Invoice[];
  nextToken?: string;
};

export type GetInvoiceResponse = Invoice;

export type CreateInvoiceRequest = InvoiceInput;

export type CreateInvoiceResponse = {
  invoiceId: string;
};

export type UpdatePaymentStatusRequest = {
  paymentStatus: PaymentStatus;
};

export type UpdatePaymentStatusResponse = {
  invoiceId: string;
};
