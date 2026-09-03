import type {
  CartPaymentMethodsTransformRunInput,
  CartPaymentMethodsTransformRunResult,
} from "../generated/api";

const NO_CHANGES: CartPaymentMethodsTransformRunResult = {
  operations: [],
};

type Configuration = {};

export function cartPaymentMethodsTransformRun(input: CartPaymentMethodsTransformRunInput): CartPaymentMethodsTransformRunResult {
  const configuration: Configuration = JSON.parse(
    input?.paymentCustomization?.metafield?.value ?? "{}"
  );
  return NO_CHANGES;
};