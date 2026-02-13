export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number, maxDigits = 1) {
  return `${(value * 100).toFixed(maxDigits)}%`;
}

export function formatRatio(value: number) {
  return `${value.toFixed(2)}x`;
}