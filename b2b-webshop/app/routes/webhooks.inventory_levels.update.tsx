import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

// Mirrors live inventory into a variant metafield on every stock change.
// Shopify's Cart/Checkout Validation Functions can't query inventory
// directly (no `inventoryQuantity` field on the Function input schema), so
// the pack-quantity-rule function reads this metafield instead to know
// whether a non-multiple-of-5 cart quantity equals the true remaining
// stock (the "sell out the last few packs" exception).
//
// JTL-Wawi is single-warehouse (per the connector's own feature flags), so
// this webhook fires once per stock change with no cross-location summing
// needed.
//
// The catalog currently has duplicate products sharing the same SKU (JTL
// sync issue, tracked in ROADMAP.md Tier 4) — a stock change only carries
// the one inventory_item_id that actually changed, but JTL doesn't
// consistently target the same duplicate every time. So this mirrors the
// value onto every variant that shares that SKU, not just the one Shopify
// resolves from the webhook payload, to avoid stale/missing stock badges
// on whichever duplicate JTL isn't currently updating.
const METAFIELD_NAMESPACE = "app--416332316673";
const METAFIELD_KEY = "available_quantity";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, admin, shop } = await authenticate.webhook(request);
  console.log(`Received inventory_levels/update webhook for ${shop}`);

  if (!admin) {
    // No offline session/access token for this shop yet.
    return new Response();
  }

  const inventoryItemId = payload.inventory_item_id as number;
  const available = payload.available as number;

  if (inventoryItemId == null || available == null) {
    return new Response();
  }

  const inventoryItemGid = `gid://shopify/InventoryItem/${inventoryItemId}`;

  const variantResponse = await admin.graphql(
    `#graphql
      query variantForInventoryItem($id: ID!) {
        inventoryItem(id: $id) {
          variant {
            id
            sku
          }
        }
      }`,
    { variables: { id: inventoryItemGid } },
  );
  const variantData = await variantResponse.json();
  const variant = variantData.data?.inventoryItem?.variant;

  if (!variant?.id) {
    return new Response();
  }

  const targetVariantIds = new Set<string>([variant.id]);

  if (variant.sku) {
    const siblingsResponse = await admin.graphql(
      `#graphql
        query variantsForSku($query: String!) {
          productVariants(first: 20, query: $query) {
            edges {
              node { id }
            }
          }
        }`,
      { variables: { query: `sku:${JSON.stringify(variant.sku)}` } },
    );
    const siblingsData = await siblingsResponse.json();
    for (const edge of siblingsData.data?.productVariants?.edges ?? []) {
      if (edge.node?.id) targetVariantIds.add(edge.node.id);
    }
  }

  await admin.graphql(
    `#graphql
      mutation setAvailableQuantity($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors { field message }
        }
      }`,
    {
      variables: {
        metafields: [...targetVariantIds].map((ownerId) => ({
          ownerId,
          namespace: METAFIELD_NAMESPACE,
          key: METAFIELD_KEY,
          type: "number_integer",
          value: String(Math.max(available, 0)),
        })),
      },
    },
  );

  return new Response();
};
