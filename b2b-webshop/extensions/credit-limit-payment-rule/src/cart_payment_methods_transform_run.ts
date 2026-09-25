import type {
  CartPaymentMethodsTransformRunInput,
  CartPaymentMethodsTransformRunResult,
} from "../generated/api";

const NO_CHANGES: CartPaymentMethodsTransformRunResult = {
  operations: [],
};

// New dealers pay their first orders in advance (Vorkasse). "Rechnung" is only
// offered once the dealer has this many *paid* orders placed within the last
// `windowDays` days. The order dates live in the customer metafield
// `$app:paid_order_dates` (see parseDates), kept up to date by the
// orders/paid webhook (app/routes/webhooks.orders.paid.tsx) — Functions can't
// query order history themselves, and `customer.numberOfOrders` also counts
// unpaid/cancelled orders. The window is evaluated here against the shop's
// current date, so a dealer who stops ordering drops back to Vorkasse without
// any webhook having to fire.
const DEFAULT_REQUIRED_PAID_ORDERS = 3;
const DEFAULT_WINDOW_DAYS = 365;
const DEFAULT_INVOICE_METHOD_NAME = "Rechnung";
const DAY_MS = 24 * 60 * 60 * 1000;

type Configuration = {
  requiredPaidOrders?: number;
  windowDays?: number;
  invoiceMethodName?: string;
};

// The metafield holds `[{ "id": "<order gid>", "date": "YYYY-MM-DD" }, ...]`.
function parseDates(value: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(value ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => (typeof entry === "string" ? entry : entry?.date))
      .filter((date): date is string => typeof date === "string");
  } catch {
    return [];
  }
}

export function cartPaymentMethodsTransformRun(input: CartPaymentMethodsTransformRunInput): CartPaymentMethodsTransformRunResult {
  const configuration: Configuration = JSON.parse(
    input?.paymentCustomization?.metafield?.value ?? "{}"
  );
  const requiredPaidOrders = configuration.requiredPaidOrders ?? DEFAULT_REQUIRED_PAID_ORDERS;
  const windowDays = configuration.windowDays ?? DEFAULT_WINDOW_DAYS;
  const invoiceMethodName = (configuration.invoiceMethodName ?? DEFAULT_INVOICE_METHOD_NAME).toLowerCase();

  // "YYYY-MM-DD" strings compare correctly as plain strings.
  const today = Date.parse(`${input.shop.localTime.date}T00:00:00Z`);
  const cutoff = new Date(today - windowDays * DAY_MS).toISOString().slice(0, 10);

  // No logged-in customer (or no metafield yet) counts as 0 paid orders.
  const paidOrders = parseDates(input.cart.buyerIdentity?.customer?.paidOrderDates?.value)
    .filter((date) => date.slice(0, 10) >= cutoff).length;
  if (paidOrders >= requiredPaidOrders) {
    return NO_CHANGES;
  }

  const invoiceMethods = input.paymentMethods.filter((method) =>
    method.name.toLowerCase().includes(invoiceMethodName)
  );

  return {
    operations: invoiceMethods.map((method) => ({
      paymentMethodHide: { paymentMethodId: method.id },
    })),
  };
};
