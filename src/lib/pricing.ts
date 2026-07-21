export const PACKAGE_PRICES_CENTS = {
  basic: 39900,
  premium: 89900,
  verified: 250000,
} as const;

export const RUSH_FEE_CENTS = 14900;

export type PackageTier = keyof typeof PACKAGE_PRICES_CENTS;

export function calculateAmountCents(tier: PackageTier, rush: boolean): number {
  const base = PACKAGE_PRICES_CENTS[tier];
  if (base === undefined) throw new Error(`Invalid package tier: ${tier}`);
  return rush ? base + RUSH_FEE_CENTS : base;
}
