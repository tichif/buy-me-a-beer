export const DONATION_IN_CENTS = parseInt(
  process.env.NEXT_PUBLIC_DONATION_IN_CENTS || '500',
  10
);

export const MAX_DONATION_IN_CENT = parseInt(
  process.env.NEXT_PUBLIC_MAX_DONATION_IN_CENTS || '1000',
  10
);
