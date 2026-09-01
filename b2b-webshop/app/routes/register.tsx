import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { authenticate } from "../shopify.server";

// App proxy endpoint for the "Händler werden" (become a retail partner) form.
// Storefront path: /apps/dealer/register (see [app_proxy] in shopify.app.toml),
// but Shopify strips the "/apps/dealer" prefix before forwarding, so this
// route file lives at the bare "/register" path to match the request it
// actually receives.
// Spec: docs/master-prompt.md sections 5-7.

const METAFIELD_NAMESPACE = "app--416332316673";

const REQUIRED_FIELDS = [
  "company_name",
  "street",
  "postal_code",
  "city",
  "country",
  "vat_id",
  "contact_first_name",
  "contact_last_name",
  "email",
  "phone",
  "privacy_accepted",
  "terms_accepted",
] as const;

function buildRedirect(request: Request, path: string, params?: Record<string, string>) {
  const url = new URL(request.url);
  const target = new URL(path, `${url.protocol}//${url.host}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      target.searchParams.set(key, value);
    }
  }
  return redirect(target.toString());
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.public.appProxy(request);
  return new Response("Method not allowed", { status: 405 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.public.appProxy(request);

  if (!admin) {
    // No app session stored for this shop yet (app not fully installed/authenticated).
    return buildRedirect(request, "/pages/haendler-werden", {
      error: "not_ready",
    });
  }

  const formData = await request.formData();
  const get = (name: string) => (formData.get(name) ?? "").toString().trim();

  const missing = REQUIRED_FIELDS.filter((field) => {
    if (field === "privacy_accepted" || field === "terms_accepted") {
      return get(field) !== "on" && get(field) !== "true";
    }
    return get(field).length === 0;
  });

  if (missing.length > 0) {
    return buildRedirect(request, "/pages/haendler-werden", {
      error: "missing_fields",
      fields: missing.join(","),
    });
  }

  const email = get("email");

  // Idempotency: don't create a duplicate dealer registration for the same email.
  const existingResponse = await admin.graphql(
    `#graphql
      query existingCustomer($query: String!) {
        customers(first: 1, query: $query) {
          nodes {
            id
            metafield(namespace: "${METAFIELD_NAMESPACE}", key: "dealer_status") {
              value
            }
          }
        }
      }`,
    { variables: { query: `email:${email}` } },
  );
  const existingData = await existingResponse.json();
  const existingCustomer = existingData.data?.customers?.nodes?.[0];

  if (existingCustomer) {
    const status = existingCustomer.metafield?.value ?? "pending";
    return buildRedirect(request, "/pages/haendleranfrage-eingegangen", {
      status,
    });
  }

  const input = {
    firstName: get("contact_first_name"),
    lastName: get("contact_last_name"),
    email,
    phone: get("phone") || undefined,
    addresses: [
      {
        company: get("company_name"),
        address1: get("street"),
        city: get("city"),
        zip: get("postal_code"),
        country: get("country"),
        firstName: get("contact_first_name"),
        lastName: get("contact_last_name"),
        phone: get("phone") || undefined,
      },
    ],
    tags: ["dealer-pending"],
    metafields: [
      { namespace: METAFIELD_NAMESPACE, key: "dealer_status", type: "single_line_text_field", value: "pending" },
      { namespace: METAFIELD_NAMESPACE, key: "legal_form", type: "single_line_text_field", value: get("legal_form") },
      { namespace: METAFIELD_NAMESPACE, key: "vat_id", type: "single_line_text_field", value: get("vat_id") },
      { namespace: METAFIELD_NAMESPACE, key: "trade_register_no", type: "single_line_text_field", value: get("trade_register_no") },
      { namespace: METAFIELD_NAMESPACE, key: "contact_position", type: "single_line_text_field", value: get("contact_position") },
      { namespace: METAFIELD_NAMESPACE, key: "company_website", type: "url", value: get("company_website") },
      { namespace: METAFIELD_NAMESPACE, key: "branches_count", type: "number_integer", value: get("branches_count") },
      { namespace: METAFIELD_NAMESPACE, key: "sales_mode", type: "single_line_text_field", value: get("sales_mode") },
      { namespace: METAFIELD_NAMESPACE, key: "registration_message", type: "multi_line_text_field", value: get("message") },
      { namespace: METAFIELD_NAMESPACE, key: "privacy_accepted", type: "boolean", value: "true" },
      { namespace: METAFIELD_NAMESPACE, key: "terms_accepted", type: "boolean", value: "true" },
    ].filter((m) => m.value !== ""),
  };

  const response = await admin.graphql(
    `#graphql
      mutation createDealer($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer { id }
          userErrors { field message }
        }
      }`,
    { variables: { input } },
  );
  const data = await response.json();
  const userErrors = data.data?.customerCreate?.userErrors ?? [];

  if (userErrors.length > 0) {
    return buildRedirect(request, "/pages/haendler-werden", {
      error: "create_failed",
      message: userErrors.map((e: { message: string }) => e.message).join("; "),
    });
  }

  return buildRedirect(request, "/pages/haendleranfrage-eingegangen", {
    status: "pending",
  });
};
