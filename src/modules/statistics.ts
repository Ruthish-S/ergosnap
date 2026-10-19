/**
 * Statistical analysis and validation engine for ErgoSnap Analytics.
 *
 * Implements:
 * - Continuous agreement: Mean Absolute Error (MAE), signed bias, Bland-Altman limits of agreement.
 * - Ordinal agreement: Exact agreement percentage, Confusion Matrix, weighted Cohen's Kappa.
 * - Descriptive statistics for samples with missing data.
 *
 * References:
 * - Bland, J. M., & Altman, D. (1986). Statistical methods for assessing agreement
 *   between two methods of clinical measurement. Lancet, 327(8476), 307-310.
 * - Cohen, J. (1968). Weighted kappa: Nominal scale agreement with provision for
 *   scaled disagreement or partial credit. Psychological Bulletin, 70(4), 213-220.
 */

export interface PairedMeasurement {
  automated: number;
  reference: number;
}

export interface ContinuousAgreement {
  n: number;
  mae: number; // Mean Absolute Error in degrees
  signedBias: number; // Mean (automated - reference)
  stdOfDifferences: number;
  loaUpper: number; // +1.96 SD
  loaLower: number; // -1.96 SD
  blandAltmanPairs: Array<{ mean: number; difference: number }>;
}

export interface OrdinalAgreement {
  n: number;
  exactAgreement: number; // 0 to 1 proportion
  exactAgreementCount: number;
  confusionMatrix: number[][]; // rows: reference, cols: automated
  weightedKappa: number | null;
  kappaInterpretation: string;
}

export interface DescriptiveStats {
  n: number;
  mean: number | null;
  median: number | null;
  stdDev: number | null;
  min: number | null;
  max: number | null;
  missingCount: number;
}

/**
 * Descriptive statistics for an array of numbers that may contain nulls.
 * Null values are counted in missingCount and excluded from numerical summaries.
 */
export function descriptiveStats(values: Array<number | null>): DescriptiveStats {
  const valid: number[] = values.filter((v): v is number => v !== null && !isNaN(v));
  const missingCount = values.length - valid.length;

  if (valid.length === 0) {
    return {
      n: 0,
      mean: null,
      median: null,
      stdDev: null,
      min: null,
      max: null,
      missingCount,
    };
  }

  const sum = valid.reduce((acc, v) => acc + v, 0);
  const mean = sum / valid.length;

  // Median
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

  // Sample Standard Deviation (N - 1)
  let stdDev: number | null = null;
  if (valid.length > 1) {
    const variance =
      valid.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) /
      (valid.length - 1);
    stdDev = Math.sqrt(variance);
  } else {
    stdDev = 0;
  }

  return {
    n: valid.length,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    min: Math.min(...valid),
    max: Math.max(...valid),
    missingCount,
  };
}

/**
 * Continuous agreement analysis: MAE, Mean Bias, and Bland-Altman limits of agreement.
 * Returns null if fewer than 2 valid paired measurements exist.
 */
export function continuousAgreement(
  pairs: PairedMeasurement[]
): ContinuousAgreement | null {
  const valid = pairs.filter(
    (p) => !isNaN(p.automated) && !isNaN(p.reference)
  );
  if (valid.length < 2) return null;

  const differences = valid.map((p) => p.automated - p.reference);
  const absDifferences = differences.map((d) => Math.abs(d));

  const mae = absDifferences.reduce((a, b) => a + b, 0) / valid.length;
  const signedBias = differences.reduce((a, b) => a + b, 0) / valid.length;

  // Variance of differences
  const diffVariance =
    differences.reduce((acc, d) => acc + Math.pow(d - signedBias, 2), 0) /
    (valid.length - 1);
  const stdOfDifferences = Math.sqrt(diffVariance);

  const loaUpper = signedBias + 1.96 * stdOfDifferences;
  const loaLower = signedBias - 1.96 * stdOfDifferences;

  const blandAltmanPairs = valid.map((p) => ({
    mean: Math.round(((p.automated + p.reference) / 2) * 10) / 10,
    difference: Math.round((p.automated - p.reference) * 10) / 10,
  }));

  return {
    n: valid.length,
    mae: Math.round(mae * 100) / 100,
    signedBias: Math.round(signedBias * 100) / 100,
    stdOfDifferences: Math.round(stdOfDifferences * 100) / 100,
    loaUpper: Math.round(loaUpper * 100) / 100,
    loaLower: Math.round(loaLower * 100) / 100,
    blandAltmanPairs,
  };
}

/**
 * Construct an (M x M) confusion matrix for discrete ordinal scores.
 * Rows = Reference scores, Columns = Automated scores.
 */
export function buildConfusionMatrix(
  pairs: PairedMeasurement[],
  minScore: number = 1,
  maxScore: number = 7
): number[][] {
  const size = maxScore - minScore + 1;
  const matrix: number[][] = Array.from({ length: size }, () =>
    new Array(size).fill(0)
  );

  for (const pair of pairs) {
    const refIdx = Math.round(pair.reference) - minScore;
    const autoIdx = Math.round(pair.automated) - minScore;

    if (refIdx >= 0 && refIdx < size && autoIdx >= 0 && autoIdx < size) {
      matrix[refIdx][autoIdx] += 1;
    }
  }

  return matrix;
}

/**
 * Compute weighted Cohen's Kappa using linear weighting.
 * Formula: kappa = 1 - (sum(w_ij * O_ij) / sum(w_ij * E_ij))
 * Linear weight: w_ij = |i - j| / (k - 1)
 */
export function weightedKappa(matrix: number[][]): number | null {
  const k = matrix.length;
  if (k <= 1) return null;

  let totalObservations = 0;
  const rowSums = new Array(k).fill(0);
  const colSums = new Array(k).fill(0);

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const count = matrix[i][j];
      totalObservations += count;
      rowSums[i] += count;
      colSums[j] += count;
    }
  }

  if (totalObservations < 2) return null;

  let observedDisagreement = 0;
  let expectedDisagreement = 0;

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const weight = Math.abs(i - j) / (k - 1); // linear weight
      const o_ij = matrix[i][j];
      const e_ij = (rowSums[i] * colSums[j]) / totalObservations;

      observedDisagreement += weight * o_ij;
      expectedDisagreement += weight * e_ij;
    }
  }

  if (expectedDisagreement === 0) {
    return observedDisagreement === 0 ? 1.0 : 0.0;
  }

  const kappa = 1 - observedDisagreement / expectedDisagreement;
  return Math.round(kappa * 1000) / 1000;
}

export function interpretKappa(kappa: number | null): string {
  if (kappa === null) return 'Insufficient data';
  if (kappa < 0.2) return 'Slight agreement';
  if (kappa < 0.4) return 'Fair agreement';
  if (kappa < 0.6) return 'Moderate agreement';
  if (kappa < 0.8) return 'Substantial agreement';
  return 'Almost perfect agreement';
}

/**
 * Calculate full ordinal agreement statistics for RULA scores.
 */
export function ordinalAgreement(
  pairs: PairedMeasurement[],
  minScore: number = 1,
  maxScore: number = 7
): OrdinalAgreement | null {
  const valid = pairs.filter(
    (p) => !isNaN(p.automated) && !isNaN(p.reference)
  );
  if (valid.length < 2) return null;

  let exactMatchCount = 0;
  for (const p of valid) {
    if (Math.round(p.automated) === Math.round(p.reference)) {
      exactMatchCount += 1;
    }
  }

  const exactAgreement = exactMatchCount / valid.length;
  const matrix = buildConfusionMatrix(valid, minScore, maxScore);
  const kappa = weightedKappa(matrix);

  return {
    n: valid.length,
    exactAgreement: Math.round(exactAgreement * 1000) / 1000,
    exactAgreementCount: exactMatchCount,
    confusionMatrix: matrix,
    weightedKappa: kappa,
    kappaInterpretation: interpretKappa(kappa),
  };
}
