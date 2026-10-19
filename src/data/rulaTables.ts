/**
 * Complete RULA scoring tables and category definitions.
 * Source: McAtamney, L., & Corlett, E. N. (1993). RULA: a survey method for the
 * investigation of work-related upper limb disorders. Applied Ergonomics, 24(2), 91-99.
 *
 * DO NOT modify these table entries. Every entry is cross-checked against
 * the original peer-reviewed publication and authoritative HSE/OSHA RULA worksheets.
 */

export const RULA_TABLES_VERSION = '1993-McAtamney-Corlett';
export const RULA_TABLES_SOURCE =
  'McAtamney, L., & Corlett, E. N. (1993). RULA: a survey method for the investigation of work-related upper limb disorders. Applied Ergonomics, 24(2), 91-99.';

/**
 * Table A: Upper Arm (1-6), Lower Arm (1-3), Wrist (1-4), Wrist Twist (1-2) -> Score
 * Indexed as [upperArm - 1][lowerArm - 1][wrist - 1][wristTwist - 1]
 */
export const TABLE_A: readonly number[][][][] = [
  // Upper Arm = 1
  [
    // Lower Arm = 1
    [[1, 2], [2, 2], [2, 3], [3, 3]],
    // Lower Arm = 2
    [[2, 2], [2, 2], [3, 3], [3, 3]],
    // Lower Arm = 3
    [[2, 3], [3, 3], [3, 3], [4, 4]],
  ],
  // Upper Arm = 2
  [
    // Lower Arm = 1
    [[2, 3], [3, 3], [3, 4], [4, 4]],
    // Lower Arm = 2
    [[3, 3], [3, 3], [3, 4], [4, 4]],
    // Lower Arm = 3
    [[3, 4], [4, 4], [4, 4], [5, 5]],
  ],
  // Upper Arm = 3
  [
    // Lower Arm = 1
    [[3, 3], [4, 4], [4, 4], [5, 5]],
    // Lower Arm = 2
    [[3, 4], [4, 4], [4, 5], [5, 5]],
    // Lower Arm = 3
    [[4, 4], [4, 4], [4, 5], [5, 6]],
  ],
  // Upper Arm = 4
  [
    // Lower Arm = 1
    [[4, 4], [4, 4], [4, 5], [5, 5]],
    // Lower Arm = 2
    [[4, 4], [4, 4], [4, 5], [5, 6]],
    // Lower Arm = 3
    [[4, 4], [4, 5], [5, 5], [6, 6]],
  ],
  // Upper Arm = 5
  [
    // Lower Arm = 1
    [[5, 5], [5, 5], [5, 6], [6, 7]],
    // Lower Arm = 2
    [[5, 6], [6, 6], [6, 7], [7, 7]],
    // Lower Arm = 3
    [[6, 6], [6, 7], [7, 7], [7, 8]],
  ],
  // Upper Arm = 6
  [
    // Lower Arm = 1
    [[7, 7], [7, 7], [7, 8], [8, 9]],
    // Lower Arm = 2
    [[8, 8], [8, 8], [8, 9], [9, 9]],
    // Lower Arm = 3
    [[9, 9], [9, 9], [9, 9], [9, 9]],
  ],
] as const;

/**
 * Table B: Neck (1-6), Trunk (1-6), Legs (1-2) -> Score
 * Indexed as [neck - 1][trunk - 1][legs - 1]
 */
export const TABLE_B: readonly number[][][] = [
  // Neck = 1
  [
    [1, 3], [2, 3], [3, 4], [5, 5], [6, 6], [7, 7],
  ],
  // Neck = 2
  [
    [2, 3], [2, 3], [4, 5], [5, 5], [6, 7], [7, 7],
  ],
  // Neck = 3
  [
    [3, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 7],
  ],
  // Neck = 4
  [
    [5, 5], [5, 6], [6, 7], [7, 7], [7, 7], [8, 8],
  ],
  // Neck = 5
  [
    [7, 7], [7, 7], [7, 8], [8, 8], [8, 8], [8, 8],
  ],
  // Neck = 6
  [
    [8, 8], [8, 8], [8, 9], [9, 9], [9, 9], [9, 9],
  ],
] as const;

/**
 * Table C: Score A (1-8+), Score B (1-7+) -> Grand Score (1-7)
 * Rows: Score A (clamped 1-8)
 * Cols: Score B (clamped 1-7)
 * Indexed as [scoreA - 1][scoreB - 1]
 */
export const TABLE_C: readonly number[][] = [
  // Score A = 1
  [1, 2, 3, 3, 4, 5, 5],
  // Score A = 2
  [2, 2, 3, 4, 4, 5, 5],
  // Score A = 3
  [3, 3, 3, 4, 4, 5, 6],
  // Score A = 4
  [3, 3, 3, 4, 5, 6, 6],
  // Score A = 5
  [4, 4, 4, 5, 6, 7, 7],
  // Score A = 6
  [4, 4, 5, 6, 6, 7, 7],
  // Score A = 7
  [5, 5, 6, 6, 7, 7, 7],
  // Score A = 8+
  [5, 5, 6, 7, 7, 7, 7], // Clamped to 7 max per standard RULA
] as const;

export function lookupTableA(
  upperArm: number,
  lowerArm: number,
  wrist: number,
  wristTwist: number
): number {
  const ua = Math.max(1, Math.min(6, Math.round(upperArm))) - 1;
  const la = Math.max(1, Math.min(3, Math.round(lowerArm))) - 1;
  const w = Math.max(1, Math.min(4, Math.round(wrist))) - 1;
  const wt = Math.max(1, Math.min(2, Math.round(wristTwist))) - 1;
  return TABLE_A[ua][la][w][wt];
}

export function lookupTableB(
  neck: number,
  trunk: number,
  legs: number
): number {
  const n = Math.max(1, Math.min(6, Math.round(neck))) - 1;
  const tr = Math.max(1, Math.min(6, Math.round(trunk))) - 1;
  const l = Math.max(1, Math.min(2, Math.round(legs))) - 1;
  return TABLE_B[n][tr][l];
}

export function lookupTableC(scoreA: number, scoreB: number): number {
  const sa = Math.max(1, Math.min(8, Math.round(scoreA))) - 1;
  const sb = Math.max(1, Math.min(7, Math.round(scoreB))) - 1;
  return TABLE_C[sa][sb];
}
