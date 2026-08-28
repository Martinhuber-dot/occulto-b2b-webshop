import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "../generated/api";

// Master-prompt section 18/68: minimum order value, kept as a single named
// constant here rather than scattered across the codebase. Server-side
// (Function) enforcement so it can't be bypassed client-side (section 18).
const MIN_ORDER_NET = 350;

export function cartValidationsGenerateRun(
  input: CartValidationsGenerateRunInput,
): CartValidationsGenerateRunResult {
  const errors: ValidationError[] = [];
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
