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
          }
        }
      }`,
    { variables: { id: inventoryItemGid } },
  );
  const variantData = await variantResponse.json();
  const variantId = variantData.data?.inventoryItem?.variant?.id;

  if (!variantId) {
    return new Response();
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
        metafields: [
          {
            ownerId: variantId,
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_KEY,
            type: "number_integer",
            value: String(Math.max(available, 0)),
          },
        ],
      },
    },
  );

  return new Response();
};
