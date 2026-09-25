export type FuelBracket = {
  min: number;
  max?: number | null;
  surcharge: number;
};

export type FuelSurchargeResult = {
  matched: FuelBracket | null;
  changed: boolean;
  previous: FuelBracket | null;
};

function matchBracket(average: number, brackets: FuelBracket[]) {
  return brackets.find((b) => average >= b.min && (b.max === null || b.max === undefined || average < b.max)) ?? null;
}

export function checkFuelSurcharge(
  aaaAverage: number,
  contractBrackets: FuelBracket[],
  previousAaaAverage?: number | null,
): FuelSurchargeResult {
  if (!Number.isFinite(aaaAverage) || aaaAverage < 0) throw new Error("A verified AAA average is required.");
  if (!contractBrackets.length) throw new Error("The contract's fuel price table is required.");

  const matched = matchBracket(aaaAverage, contractBrackets);
  const previous = previousAaaAverage === null || previousAaaAverage === undefined
    ? null
    : matchBracket(previousAaaAverage, contractBrackets);

  return {
    matched,
    previous,
    changed: Boolean(previous && matched && previous.surcharge !== matched.surcharge) || Boolean(!previous && matched),
  };
}
