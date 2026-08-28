import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// Admin approval screen for pending dealer registrations.
// Spec: docs/master-prompt.md sections 6 and 55.

const NS = "app--416332316673";

const PENDING_CUSTOMERS_QUERY = `#graphql
  query pendingDealers {
    customers(first: 50, query: "tag:dealer-pending") {
      nodes {
        id
        displayName
        email
        phone
        defaultAddress { address1 city zip country company }
        legalForm: metafield(namespace: "${NS}", key: "legal_form") { value }
        vatId: metafield(namespace: "${NS}", key: "vat_id") { value }
        contactPosition: metafield(namespace: "${NS}", key: "contact_position") { value }
        companyWebsite: metafield(namespace: "${NS}", key: "company_website") { value }
        salesMode: metafield(namespace: "${NS}", key: "sales_mode") { value }
        registrationMessage: metafield(namespace: "${NS}", key: "registration_message") { value }
      }
    }
  }
`;

interface PendingDealer {
  id: string;
  displayName: string;
  email: string;
  phone: string | null;
  defaultAddress: { address1: string; city: string; zip: string; country: string; company: string } | null;
  legalForm: { value: string } | null;
  vatId: { value: string } | null;
  contactPosition: { value: string } | null;
  companyWebsite: { value: string } | null;
  salesMode: { value: string } | null;
  registrationMessage: { value: string } | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(PENDING_CUSTOMERS_QUERY);
  const data = await response.json();
  return { dealers: data.data.customers.nodes as PendingDealer[] };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const customerId = formData.get("customerId")?.toString();

  if (!customerId) {
    return { error: "Missing customerId" };
  }

  const customerResponse = await admin.graphql(
    `#graphql
      query dealer($id: ID!) {
        customer(id: $id) {
          id
          displayName
          email
          defaultAddress { address1 city zip country }
          vatId: metafield(namespace: "${NS}", key: "vat_id") { value }
        }
      }`,
    { variables: { id: customerId } },
  );
  const customerData = await customerResponse.json();
  const customer = customerData.data.customer;
  const address = customer.defaultAddress;

  const companyResponse = await admin.graphql(
    `#graphql
      mutation createCompany($input: CompanyCreateInput!) {
        companyCreate(input: $input) {
          company {
            id
            defaultRole { id }
            locations(first: 1) { nodes { id } }
          }
          userErrors { field message }
        }
      }`,
    {
      variables: {
        input: {
          company: { name: customer.displayName },
          companyLocation: {
            name: "Hauptstandort",
            billingSameAsShipping: true,
            taxRegistrationId: customer.vatId?.value || undefined,
            shippingAddress: address
              ? {
                  address1: address.address1,
                  city: address.city,
                  zip: address.zip,
                  countryCode: address.country,
                }
              : undefined,
          },
        },
      },
    },
  );
  const companyData = await companyResponse.json();
  const companyErrors = companyData.data?.companyCreate?.userErrors ?? [];
  if (companyErrors.length > 0) {
    return { error: companyErrors.map((e: { message: string }) => e.message).join("; ") };
  }

  const company = companyData.data.companyCreate.company;
  const locationId = company.locations.nodes[0]?.id;

  const assignResponse = await admin.graphql(
    `#graphql
      mutation assignContact($companyId: ID!, $customerId: ID!) {
        companyAssignCustomerAsContact(companyId: $companyId, customerId: $customerId) {
          companyContact { id }
          userErrors { field message }
        }
      }`,
    { variables: { companyId: company.id, customerId } },
  );
  const assignData = await assignResponse.json();
  const assignErrors = assignData.data?.companyAssignCustomerAsContact?.userErrors ?? [];
  if (assignErrors.length > 0) {
    return { error: assignErrors.map((e: { message: string }) => e.message).join("; ") };
  }
  const companyContactId = assignData.data.companyAssignCustomerAsContact.companyContact.id;

  // Best-effort: grant ordering rights at the location and send Shopify's native welcome email.
  // Neither failure should block the core approval (company + contact already exist at this point).
  if (locationId && company.defaultRole?.id) {
    try {
      await admin.graphql(
        `#graphql
          mutation assignRole($companyContactId: ID!, $rolesToAssign: [CompanyContactRoleAssign!]!) {
            companyContactAssignRoles(companyContactId: $companyContactId, rolesToAssign: $rolesToAssign) {
              userErrors { field message }
            }
          }`,
        {
          variables: {
            companyContactId,
            rolesToAssign: [{ companyContactRoleId: company.defaultRole.id, companyLocationId: locationId }],
          },
        },
      );
    } catch {
      // non-fatal
    }
  }

  try {
    await admin.graphql(
      `#graphql
        mutation sendWelcome($companyContactId: ID!) {
          companyContactSendWelcomeEmail(companyContactId: $companyContactId) {
            userErrors { field message }
          }
        }`,
      { variables: { companyContactId } },
    );
  } catch {
    // non-fatal
  }

  await admin.graphql(
    `#graphql
      mutation markApproved($input: CustomerInput!) {
        customerUpdate(input: $input) {
          userErrors { field message }
        }
      }`,
    {
      variables: {
        input: {
          id: customerId,
          tags: ["dealer-approved"],
          metafields: [
            { namespace: NS, key: "dealer_status", type: "single_line_text_field", value: "approved" },
          ],
        },
      },
    },
  );

  return { success: true, companyId: company.id };
};

export default function Dealers() {
  const { dealers } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  useEffect(() => {
    if (fetcher.data && "success" in fetcher.data && fetcher.data.success) {
      shopify.toast.show("Händler freigegeben");
    } else if (fetcher.data && "error" in fetcher.data) {
      shopify.toast.show(fetcher.data.error as string, { isError: true });
    }
  }, [fetcher.data, shopify]);

  const approve = (customerId: string) =>
    fetcher.submit({ customerId }, { method: "POST" });

  return (
    <s-page heading="Händleranfragen">
      <s-section heading={`Ausstehend (${dealers.length})`}>
        {dealers.length === 0 ? (
          <s-paragraph>Keine offenen Händleranfragen.</s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {dealers.map((dealer) => {
              const isSubmitting =
                fetcher.state !== "idle" &&
                fetcher.formData?.get("customerId") === dealer.id;
              return (
                <s-box
                  key={dealer.id}
                  padding="base"
                  borderWidth="base"
                  borderRadius="base"
                >
                  <s-stack direction="block" gap="small">
                    <s-heading>
                      {dealer.defaultAddress?.company || dealer.displayName}
                    </s-heading>
                    <s-paragraph>
                      {dealer.displayName} · {dealer.email} · {dealer.phone}
                    </s-paragraph>
                    <s-paragraph>
                      {dealer.defaultAddress?.address1}, {dealer.defaultAddress?.zip}{" "}
                      {dealer.defaultAddress?.city}, {dealer.defaultAddress?.country}
                    </s-paragraph>
                    <s-paragraph>USt-ID: {dealer.vatId?.value || "–"}</s-paragraph>
                    {dealer.registrationMessage?.value && (
                      <s-paragraph>
                        Nachricht: {dealer.registrationMessage.value}
                      </s-paragraph>
                    )}
                    <s-button
                      onClick={() => approve(dealer.id)}
                      {...(isSubmitting ? { loading: true } : {})}
                    >
                      Freigeben
                    </s-button>
                  </s-stack>
                </s-box>
              );
            })}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}
