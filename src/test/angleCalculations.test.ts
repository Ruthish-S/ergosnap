import { describe, it, expect } from 'vitest';
import {
  angleBetween,
  angleFromVertical,
  angleFromHorizontal,
  type Point2D,
} from '../modules/angleCalculations';

describe('angleCalculations module', () => {
  it('calculates a 90-degree right angle accurately', () => {
    const A: Point2D = { x: 0, y: 1 };
    const B: Point2D = { x: 0, y: 0 };
    const C: Point2D = { x: 1, y: 0 };

    const res = angleBetween(A, B, C);
    expect(res.isValid).toBe(true);
    expect(res.valueDegrees).toBe(90);
  });

  it('calculates a 180-degree straight line accurately', () => {
    const A: Point2D = { x: -1, y: 0 };
    const B: Point2D = { x: 0, y: 0 };
    const C: Point2D = { x: 1, y: 0 };

    const res = angleBetween(A, B, C);
    expect(res.isValid).toBe(true);
    expect(res.valueDegrees).toBe(180);
  });

  it('calculates a 45-degree angle correctly', () => {
    const A: Point2D = { x: 1, y: 0 };
    const B: Point2D = { x: 0, y: 0 };
    const C: Point2D = { x: 1, y: 1 };

    const res = angleBetween(A, B, C);
    expect(res.isValid).toBe(true);
    expect(res.valueDegrees).toBe(45);
  });

  it('rejects zero-length vectors and returns isValid=false with null degrees', () => {
    const A: Point2D = { x: 0, y: 0 };
    const B: Point2D = { x: 0, y: 0 }; // vertex coincident with A
    const C: Point2D = { x: 1, y: 0 };

    const res = angleBetween(A, B, C);
    expect(res.isValid).toBe(false);
    expect(res.valueDegrees).toBeNull();
    expect(res.invalidReason).toBeDefined();
  });

  it('calculates angle from vertical (straight down is 0 degrees)', () => {
    const from: Point2D = { x: 100, y: 100 };
    const to: Point2D = { x: 100, y: 200 }; // Straight downwards

    const res = angleFromVertical(from, to);
    expect(res.isValid).toBe(true);
    expect(res.valueDegrees).toBe(0);
  });

  it('calculates angle from vertical (horizontal vector is 90 degrees)', () => {
    const from: Point2D = { x: 100, y: 100 };
    const to: Point2D = { x: 200, y: 100 }; // Horizontal rightwards

    const res = angleFromVertical(from, to);
    expect(res.isValid).toBe(true);
    expect(res.valueDegrees).toBe(90);
  });

  it('calculates angle from horizontal (pointing straight right is 0 degrees)', () => {
    const from: Point2D = { x: 0, y: 0 };
    const to: Point2D = { x: 50, y: 0 };

    const res = angleFromHorizontal(from, to);
    expect(res.isValid).toBe(true);
    expect(res.valueDegrees).toBe(0);
  });

  it('properly clamps cosine argument to prevent NaN on floating point boundary', () => {
    // Vectors with identical direction
    const A: Point2D = { x: 1.0000001, y: 1.0000001 };
    const B: Point2D = { x: 0, y: 0 };
    const C: Point2D = { x: 2.0, y: 2.0 };

    const res = angleBetween(A, B, C);
    expect(res.isValid).toBe(true);
    expect(res.valueDegrees).toBe(0);
  });
});
