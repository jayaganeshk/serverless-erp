const axios = require("axios");

describe("ERP API Integration Tests", () => {
  let apiUrl;
  let createdInvoiceId;

  beforeAll(() => {
    apiUrl = process.env.ServiceEndpoint;

    if (!apiUrl) {
      throw new Error("ServiceEndpoint environment variable is not set");
    }

    console.log(`Testing API at: ${apiUrl}`);
  });

  describe("Invoice CRUD Operations", () => {
    test("1. Create Invoice", async () => {
      const invoiceData = {
        customerId: "customer-123",
        date: "2024-01-15T10:00:00Z",
        dueDate: "2024-02-15T10:00:00Z",
        amount: 1500.0,
        paymentStatus: "UNPAID",
        items: [
          {
            description: "Web Development Service",
            quantity: 10,
            unitPrice: 100.0,
          },
          {
            description: "Hosting Service",
            quantity: 1,
            unitPrice: 500.0,
          },
        ],
      };

      const response = await axios.post(`${apiUrl}/invoice`, invoiceData);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("invoiceId");
      expect(response.data.invoiceId).toBeDefined();

      // Store the created invoice ID for later tests
      createdInvoiceId = response.data.invoiceId;

      console.log("Created invoice:", createdInvoiceId);
    });

    test("2. Get Single Invoice", async () => {
      expect(createdInvoiceId).toBeDefined();

      const response = await axios.get(`${apiUrl}/invoice/${createdInvoiceId}`);

      expect(response.status).toBe(200);
      //   expect(response.data).toHaveProperty("invoice");
      expect(response.data.invoiceId).toBe(createdInvoiceId);
      expect(response.data.customerId).toBe("customer-123");
      expect(response.data.paymentStatus).toBe("UNPAID");
      expect(response.data.amount).toBe(1500.0);
      expect(response.data.items).toHaveLength(2);

      console.log("Retrieved invoice:", response.data);
    });

    test("3. Get All Invoices", async () => {
      const response = await axios.get(`${apiUrl}/invoices`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("invoices");
      expect(Array.isArray(response.data.invoices)).toBe(true);
      expect(response.data.invoices.length).toBeGreaterThan(0);

      // Check if our created invoice is in the list
      const ourInvoice = response.data.invoices.find(
        (invoice) => invoice.invoiceId === createdInvoiceId
      );
      expect(ourInvoice).toBeDefined();

      console.log(`Found ${response.data.invoices.length} invoices`);
    });

    test("4. Get Invoices with Customer Filter", async () => {
      const response = await axios.get(
        `${apiUrl}/invoices?customerId=customer-123`
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("invoices");
      expect(Array.isArray(response.data.invoices)).toBe(true);

      // All returned invoices should belong to customer-123
      response.data.invoices.forEach((invoice) => {
        expect(invoice.customerId).toBe("customer-123");
      });

      console.log(
        `Found ${response.data.invoices.length} invoices for customer-123`
      );
    });

    test("5. Get Invoices with Payment Status Filter", async () => {
      const response = await axios.get(
        `${apiUrl}/invoices?paymentStatus=UNPAID`
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("invoices");
      expect(Array.isArray(response.data.invoices)).toBe(true);

      // All returned invoices should be UNPAID
      response.data.invoices.forEach((invoice) => {
        expect(invoice.paymentStatus).toBe("UNPAID");
      });

      console.log(`Found ${response.data.invoices.length} UNPAID invoices`);
    });

    test("6. Update Payment Status", async () => {
      expect(createdInvoiceId).toBeDefined();

      const updateData = {
        paymentStatus: "PAID",
      };

      const response = await axios.post(
        `${apiUrl}/invoice/${createdInvoiceId}/payment-status`,
        updateData
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("invoiceId");

      console.log("Payment status updated:", response.data);
    });

    test("7. Verify Payment Status Update", async () => {
      expect(createdInvoiceId).toBeDefined();

      const response = await axios.get(`${apiUrl}/invoice/${createdInvoiceId}`);

      expect(response.status).toBe(200);
      expect(response.data.paymentStatus).toBe("PAID");

      console.log("Verified payment status is now PAID");
    });
  });

  describe("Error Handling", () => {
    test("should return 404 for non-existent invoice", async () => {
      try {
        await axios.get(`${apiUrl}/invoice/non-existent-id`);
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    test("should return error for invalid payment status", async () => {
      expect(createdInvoiceId).toBeDefined();

      try {
        await axios.post(
          `${apiUrl}/invoice/${createdInvoiceId}/payment-status`,
          {
            paymentStatus: "INVALID_STATUS",
          }
        );
      } catch (error) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });

    test("should return error for invalid invoice data", async () => {
      try {
        await axios.post(`${apiUrl}/invoice`, {
          // Missing required fields
          customerId: "test",
        });
      } catch (error) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});
