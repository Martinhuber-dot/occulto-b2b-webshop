import type { ActionFunctionArgs } from "react-router";

// Shopify CarrierService callback (Settings → Shipping and delivery →
// Deutschland-Zone → "von Drittanbieter berechnete Tarife"). Registered once
// via carrierServiceCreate against this route's absolute URL. Shopify calls
// this directly with no signature/HMAC (unlike webhooks), so there is
// deliberately no authenticate.* call here — the callback URL itself is the
// only access boundary, same as any other CarrierService integration.
//
// Business rule (Martin, 090326): B2B-Händler zahlen 9,99€ Versand pro
// angefangenes Paket, ein Paket fasst 275 Packs. "Pack" = die Warenkorb-Menge
// wie sie im Checkout schon als "/Pack" angezeigt wird (5er-Gebinde), also
// einfach die Summe aller item.quantity aus dem CarrierService-Request.
const PACKS_PER_PACKAGE = 275;
const PRICE_PER_PACKAGE_EUR = 9.99;

type CarrierServiceItem = {
  quantity?: number;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { rate?: { items?: CarrierServiceItem[]; currency?: string } };
  try {
    body = await request.json();
  } catch {
    return Response.json({ rates: [] });
  }

  const items = body.rate?.items ?? [];
  const totalPacks = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);

  if (totalPacks <= 0) {
    return Response.json({ rates: [] });
  }

  const packages = Math.ceil(totalPacks / PACKS_PER_PACKAGE);
  const totalPriceCents = Math.round(packages * PRICE_PER_PACKAGE_EUR * 100);

  return Response.json({
    rates: [
      {
        service_name: "Versand",
        service_code: "OCCULTO_PACKAGE_RATE",
        total_price: String(totalPriceCents),
        currency: body.rate?.currency ?? "EUR",
        description: `${packages} Paket${packages === 1 ? "" : "e"} à ${PACKS_PER_PACKAGE} Packs`,
      },
    ],
  });
};
