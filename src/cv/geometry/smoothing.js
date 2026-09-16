export class ExponentialSmoother {
  constructor(alpha = 0.25) {
    this.alpha = alpha;
    this.value = null;
  }

  update(nextValue) {
    if (
      !Number.isFinite(nextValue)
    ) {
      return this.value;
    }

    if (this.value == null) {
      this.value = nextValue;
      return this.value;
    }

    this.value =
      this.alpha * nextValue +
      (1 - this.alpha) *
        this.value;

    return this.value;
  }

  reset() {
    this.value = null;
  }
}

export function median(values) {
  const sorted = values
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  if (!sorted.length) {
    return null;
  }

  const middle =
    Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
  }

  return sorted[middle];
}
