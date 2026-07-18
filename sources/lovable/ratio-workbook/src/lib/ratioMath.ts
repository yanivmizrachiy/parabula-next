export type Ratio = readonly [number, number];

function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a finite positive number`);
  }
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

export function simplifyRatio(a: number, b: number): Ratio {
  assertFinitePositive(a, 'ratio first term');
  assertFinitePositive(b, 'ratio second term');
  const divisor = gcd(a, b);
  return [a / divisor, b / divisor] as const;
}

export function areEquivalentRatios(a: Ratio, b: Ratio): boolean {
  return a[0] * b[1] === a[1] * b[0];
}

export function splitByRatio(total: number, parts: readonly number[]): number[] {
  assertFinitePositive(total, 'total');
  if (parts.length < 2 || parts.some((part) => !Number.isFinite(part) || part <= 0)) {
    throw new Error('ratio parts must contain at least two finite positive values');
  }
  const sum = parts.reduce((acc, part) => acc + part, 0);
  return parts.map((part) => (total * part) / sum);
}

export function splitWholeItems(total: number, parts: readonly number[]): number[] {
  if (!Number.isInteger(total)) {
    throw new Error('whole-item total must be an integer');
  }
  const result = splitByRatio(total, parts);
  if (result.some((value) => !Number.isInteger(value))) {
    throw new Error(`ratio ${parts.join(':')} does not split ${total} into whole items`);
  }
  return result;
}

export function proportionalValue(knownValue: number, knownPart: number, requestedPart: number): number {
  assertFinitePositive(knownValue, 'known value');
  assertFinitePositive(knownPart, 'known ratio part');
  assertFinitePositive(requestedPart, 'requested ratio part');
  return (knownValue * requestedPart) / knownPart;
}

export function solvePositiveRatioProduct(firstPart: number, secondPart: number, product: number): Ratio {
  assertFinitePositive(firstPart, 'first ratio part');
  assertFinitePositive(secondPart, 'second ratio part');
  assertFinitePositive(product, 'product');
  const scale = Math.sqrt(product / (firstPart * secondPart));
  if (!Number.isFinite(scale)) {
    throw new Error('ratio-product problem has no finite positive solution');
  }
  return [firstPart * scale, secondPart * scale] as const;
}

export function fractionOfWhole(part: number, whole: number): Ratio {
  if (part < 0 || whole <= 0 || part > whole) {
    throw new Error('part must satisfy 0 ≤ part ≤ whole');
  }
  if (part === 0) return [0, 1] as const;
  return simplifyRatio(part, whole);
}

export function ratioText(ratio: readonly number[]): string {
  return ratio.join(' : ');
}
