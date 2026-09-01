import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "../generated/api";

// Master-prompt section 18/68: minimum order value, kept as a single named
// constant here rather than scattered across the codebase. Server-side
// (Function) enforcement so it can't be bypassed client-side (section 18).
const MIN_ORDER_NET = 500;

export function cartValidationsGenerateRun(
  input: CartValidationsGenerateRunInput,
): CartValidationsGenerateRunResult {
  const errors: ValidationError[] = [];

  // Only enforce the minimum at checkout (section 18: "Checkout darf unter
  // 500 € netto nicht abgeschlossen werden"). Validating during
  // CART_INTERACTION would block adding the very first item to an empty
  // cart, since no single item ever reaches 500 € on its own.
  if (input.buyerJourney.step === "CART_INTERACTION") {
    return { operations: [{ validationAdd: { errors } }] };
  }

  const subtotal = Number(input.cart.cost.subtotalAmount.amount);

  if (subtotal < MIN_ORDER_NET) {
    const missing = (MIN_ORDER_NET - subtotal).toFixed(2);
    errors.push({
      message: `Der Mindestbestellwert von ${MIN_ORDER_NET.toFixed(2)} € netto wurde noch nicht erreicht. Es fehlen noch ${missing} €.`,
      target: "$.cart",
    });
  }

  return {
    operations: [
      {
        validationAdd: {
          errors,
        },
      },
    ],
  };
}
