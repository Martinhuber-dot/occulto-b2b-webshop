import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

// Keeps the customer metafield `paid_order_dates` in sync with the dealer's
// paid orders of the last 365 days. The credit-limit-payment-rule function
// reads it to hide "Rechnung" until the dealer has 3 paid orders within that
// window (first orders are Vorkasse). Payment Functions can't query order
// history, and `customer.numberOfOrders` also counts unpaid/cancelled
// orders, so the data has to be mirrored here.
//
// Stored as `[{ id, date }]` keyed by order id: re-delivered webhooks can't
// double-count, and entries already recorded survive even though the app's
// read_orders scope only sees the last 60 days of orders. The 365-day window
// itself is applied in the function against the current date; entries older
// than that are only pruned here to keep the metafield small.
const METAFIELD_NAMESPACE = "app--416332316673";
const METAFIELD_KEY = "paid_order_dates";
const WINDOW_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

type PaidOrder = { id: string; date: string };

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, admin, shop } = await authenticate.webhook(request);
  console.log(`Received orders/paid webhook for ${shop}`);

  if (!admin) {
    // No offline session/access token for this shop yet.
    return new Response();
  }

  const customerId = payload.customer?.id as number | undefined;
  if (!customerId) {
    return new Response();
  }

  const customerGid = `gid://shopify/Customer/${customerId}`;
  const cutoff = new Date(Date.now() - WINDOW_DAYS * DAY_MS).toISOString().slice(0, 10);

  const response = await admin.graphql(
    `#graphql
      query paidOrderDates($customerId: ID!, $query: String!) {
        customer(id: $customerId) {
          metafield(namespace: "${METAFIELD_NAMESPACE}", key: "${METAFIELD_KEY}") {
            value
          }
        }
        orders(first: 250, query: $query) {
          nodes { id createdAt }
        }
      }`,
    {
      variables: {
        customerId: customerGid,
        query: `customer_id:${customerId} AND created_at:>=${cutoff} AND (financial_status:paid OR financial_status:partially_refunded)`,
      },
    },
  );
  const data = (await response.json()).data;

  const byId = new Map<string, string>();
  try {
    for (const entry of JSON.parse(data?.customer?.metafield?.value ?? "[]")) {
      if (entry?.id && entry?.date) byId.set(entry.id, entry.date);
    }
  } catch {
    // Corrupt value: rebuild from the orders query below.
  }
  for (const order of data?.orders?.nodes ?? []) {
    byId.set(order.id, order.createdAt.slice(0, 10));
  }
  // The order that triggered this webhook, in case search indexing lags.
  if (payload.admin_graphql_api_id && payload.created_at) {
    byId.set(payload.admin_graphql_api_id, String(payload.created_at).slice(0, 10));
  }

  const paidOrders: PaidOrder[] = [...byId]
    .map(([id, date]) => ({ id, date }))
    .filter((order) => order.date >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));

  await admin.graphql(
    `#graphql
      mutation setPaidOrderDates($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors { field message }
        }
      }`,
    {
      variables: {
        metafields: [
          {
            ownerId: customerGid,
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_KEY,
            type: "json",
            value: JSON.stringify(paidOrders),
          },
        ],
      },
    },
  );

  return new Response();
};
