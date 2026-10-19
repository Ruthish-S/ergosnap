import { describe, it, expect } from 'vitest';
import {
  descriptiveStats,
  continuousAgreement,
  ordinalAgreement,
  buildConfusionMatrix,
  weightedKappa,
  type PairedMeasurement,
} from '../modules/statistics';

describe('statistics module', () => {
  it('computes descriptive statistics accurately and tracks missing counts', () => {
    const data = [10, 20, 30, null, 40, null];
    const stats = descriptiveStats(data);

    expect(stats.n).toBe(4);
    expect(stats.missingCount).toBe(2);
    expect(stats.mean).toBe(25);
    expect(stats.median).toBe(25);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(40);
  });

  it('handles completely null arrays without crashing', () => {
    const stats = descriptiveStats([null, null]);
    expect(stats.n).toBe(0);
    expect(stats.mean).toBeNull();
    expect(stats.missingCount).toBe(2);
  });

  it('computes continuous agreement MAE and signed bias accurately', () => {
    const pairs: PairedMeasurement[] = [
      { automated: 12, reference: 10 }, // diff = +2
      { automated: 20, reference: 22 }, // diff = -2
      { automated: 30, reference: 30 }, // diff = 0
      { automated: 45, reference: 40 }, // diff = +5
    ];

    const agreement = continuousAgreement(pairs);
    expect(agreement).not.toBeNull();
    // MAE = (2 + 2 + 0 + 5) / 4 = 9 / 4 = 2.25
    expect(agreement!.mae).toBe(2.25);
    // Signed Bias = (2 - 2 + 0 + 5) / 4 = 5 / 4 = 1.25
    expect(agreement!.signedBias).toBe(1.25);
    expect(agreement!.blandAltmanPairs.length).toBe(4);
  });

  it('returns null for continuous agreement when sample size is below 2', () => {
    const singlePair: PairedMeasurement[] = [{ automated: 10, reference: 10 }];
    expect(continuousAgreement(singlePair)).toBeNull();
  });

  it('constructs an accurate confusion matrix for ordinal categories', () => {
    const pairs: PairedMeasurement[] = [
      { automated: 3, reference: 3 },
      { automated: 4, reference: 3 },
      { automated: 5, reference: 5 },
    ];

    const matrix = buildConfusionMatrix(pairs, 1, 7);
    expect(matrix.length).toBe(7);
    expect(matrix[0].length).toBe(7);

    // ref 3 (index 2), auto 3 (index 2)
    expect(matrix[2][2]).toBe(1);
    // ref 3 (index 2), auto 4 (index 3)
    expect(matrix[2][3]).toBe(1);
    // ref 5 (index 4), auto 5 (index 4)
    expect(matrix[4][4]).toBe(1);
  });

  it('calculates weighted Cohen’s Kappa with high value for strong agreement', () => {
    // Perfect agreement matrix
    const matrix = [
      [5, 0, 0],
      [0, 5, 0],
      [0, 0, 5],
    ];

    const kappa = weightedKappa(matrix);
    expect(kappa).toBe(1.0);
  });

  it('computes complete ordinal agreement summary', () => {
    const pairs: PairedMeasurement[] = [
      { automated: 1, reference: 1 },
      { automated: 2, reference: 2 },
      { automated: 3, reference: 4 },
      { automated: 5, reference: 5 },
    ];

    const res = ordinalAgreement(pairs, 1, 7);
    expect(res).not.toBeNull();
    expect(res!.n).toBe(4);
    expect(res!.exactAgreementCount).toBe(3);
    expect(res!.exactAgreement).toBe(0.75);
    expect(res!.weightedKappa).toBeGreaterThan(0.7);
  });
});
