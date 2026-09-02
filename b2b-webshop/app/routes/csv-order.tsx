import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

// App proxy endpoint for the CSV bulk-order upload (master-prompt §27,
// "SKU;Menge" format). Storefront path: /apps/dealer/csv-order (see
// [app_proxy] in shopify.app.toml), but Shopify strips the "/apps/dealer"
// prefix before forwarding, so this route lives at the bare "/csv-order"
// path to match the request it actually receives (same reasoning as
// register.tsx).
//
// This route only looks up and validates SKUs — it never touches the
// customer's cart itself. The theme's own JS (assets/csv-order.js) adds the
// validated lines to the cart client-side via the storefront's native
// /cart/add.js, the same way the existing quick-order list does, so the
// customer's own session/cart is never handled server-side here.

const PACK_STEP = 5;
const MAX_LINES = 200;

type ParsedLine = { sku: string; quantity: number };

function parseCsv(text: string): ParsedLine[] {
  const lines = text
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const quantityBySku = new Map<string, number>();

  for (const line of lines) {
    const [rawSku, rawQuantity] = line.split(";").map((part) => (part ?? "").trim());
    if (!rawSku || !rawQuantity) continue;

    const quantity = Number.parseInt(rawQuantity, 10);
    if (!Number.isFinite(quantity) || quantity <= 0) continue; // skips a header row like "SKU;Menge" too

    quantityBySku.set(rawSku, (quantityBySku.get(rawSku) ?? 0) + quantity);
  }

  return Array.from(quantityBySku.entries()).map(([sku, quantity]) => ({ sku, quantity }));
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.public.appProxy(request);
  return new Response("Method not allowed", { status: 405 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.public.appProxy(request);

  if (!admin) {
    return Response.json({ error: "not_ready" }, { status: 503 });
  }

  const body = await request.text();
  const parsedLines = parseCsv(body).slice(0, MAX_LINES);

  if (parsedLines.length === 0) {
    return Response.json({ error: "empty" }, { status: 400 });
  }

  const searchQuery = parsedLines
    .map((line) => `sku:'${line.sku.replace(/'/g, "")}'`)
    .join(" OR ");

  const response = await admin.graphql(
    `#graphql
      query variantsBySku($query: String!, $first: Int!) {
        productVariants(first: $first, query: $query) {
          nodes {
            id
            sku
            price
            inventoryQuantity
            product {
              title
            }
          }
        }
      }`,
    { variables: { query: searchQuery, first: parsedLines.length } },
  );
  const data = await response.json();
  const variants = data.data?.productVariants?.nodes ?? [];
  const variantBySku = new Map(variants.map((v: { sku: string }) => [v.sku, v]));

  const results = parsedLines.map(({ sku, quantity }) => {
    const variant = variantBySku.get(sku) as
      | { id: string; sku: string; price: string; inventoryQuantity: number; product: { title: string } }
      | undefined;

    if (!variant) {
      return { sku, quantity, found: false };
    }

    const numericVariantId = variant.id.split("/").pop();
    const availableQuantity = Math.max(variant.inventoryQuantity ?? 0, 0);
    const exceedsStock = quantity > availableQuantity;
    const notPackMultiple = quantity % PACK_STEP !== 0 && quantity !== availableQuantity;

    return {
      sku,
      quantity,
      found: true,
      variantId: numericVariantId,
      title: variant.product.title,
      price: variant.price,
      availableQuantity,
      exceedsStock,
      notPackMultiple,
    };
  });

  return Response.json({ results });
};
