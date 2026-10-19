import { describe, it, expect } from 'vitest';
import {
  scoreUpperArm,
  scoreLowerArm,
  scoreWrist,
  scoreWristTwist,
  scoreNeck,
  scoreTrunk,
  scoreLegs,
  muscleUseAdjustment,
  forceLoadAdjustment,
  calculateRula,
  scoreToActionLevel,
} from '../modules/rulaScoring';
import { lookupTableA, lookupTableB, lookupTableC } from '../data/rulaTables';
import type { ManualInputs } from '../types/assessment';

describe('RULA scoring engine (McAtamney & Corlett 1993)', () => {
  it('correctly scores upper arm flexion boundaries', () => {
    expect(scoreUpperArm(0)).toBe(1); // 20 flex to 20 ext
    expect(scoreUpperArm(20)).toBe(1);
    expect(scoreUpperArm(35)).toBe(2); // 20-45 flex
    expect(scoreUpperArm(60)).toBe(3); // 45-90 flex
    expect(scoreUpperArm(100)).toBe(4); // >90 flex
    expect(scoreUpperArm(-25)).toBe(2); // >20 ext
  });

  it('correctly applies upper arm adjustments', () => {
    expect(scoreUpperArm(35, { shoulderRaised: true })).toBe(3); // 2 + 1
    expect(scoreUpperArm(35, { upperArmAbducted: true })).toBe(3); // 2 + 1
    expect(scoreUpperArm(35, { leaningArm: true })).toBe(1); // 2 - 1
    expect(scoreUpperArm(0, { leaningArm: true })).toBe(1); // Min clamp to 1
  });

  it('correctly scores lower arm flexion boundaries', () => {
    expect(scoreLowerArm(80)).toBe(1); // 60-100 flex
    expect(scoreLowerArm(45)).toBe(2); // <60 flex
    expect(scoreLowerArm(115)).toBe(2); // >100 flex
    expect(scoreLowerArm(80, true)).toBe(2); // Midline adjust
  });

  it('correctly scores wrist and twist posture', () => {
    expect(scoreWrist(0)).toBe(1);
    expect(scoreWrist(10)).toBe(2);
    expect(scoreWrist(25)).toBe(3);
    expect(scoreWrist(10, true)).toBe(3); // +1 deviated
    expect(scoreWristTwist('mid_range')).toBe(1);
    expect(scoreWristTwist('near_end')).toBe(2);
  });

  it('correctly scores neck posture boundaries', () => {
    expect(scoreNeck(5)).toBe(1); // 0-10 flex
    expect(scoreNeck(15)).toBe(2); // 10-20 flex
    expect(scoreNeck(28)).toBe(3); // >20 flex
    expect(scoreNeck(-5)).toBe(4); // In extension
    expect(scoreNeck(15, { neckTwist: true })).toBe(3); // +1
  });

  it('correctly scores trunk posture boundaries', () => {
    expect(scoreTrunk(0)).toBe(1); // Upright
    expect(scoreTrunk(15)).toBe(2); // 0-20 flex
    expect(scoreTrunk(35)).toBe(3); // 20-60 flex
    expect(scoreTrunk(75)).toBe(4); // >60 flex
    expect(scoreTrunk(-10)).toBe(4); // In extension
  });

  it('correctly scores legs support', () => {
    expect(scoreLegs(true)).toBe(1);
    expect(scoreLegs(false)).toBe(2);
  });

  it('correctly scores muscle use and force/load adjustments', () => {
    expect(muscleUseAdjustment('occasional')).toBe(0);
    expect(muscleUseAdjustment('static_or_repeated')).toBe(1);

    expect(forceLoadAdjustment('none')).toBe(0);
    expect(forceLoadAdjustment('light')).toBe(1);
    expect(forceLoadAdjustment('moderate_or_greater')).toBe(2);
  });

  it('accurately verifies Table A lookups against worked reference examples', () => {
    // UpperArm=1, LowerArm=1, Wrist=1, Twist=1 -> 1
    expect(lookupTableA(1, 1, 1, 1)).toBe(1);
    // UpperArm=3, LowerArm=2, Wrist=2, Twist=1 -> 4
    expect(lookupTableA(3, 2, 2, 1)).toBe(4);
    // UpperArm=6, LowerArm=3, Wrist=4, Twist=2 -> 9
    expect(lookupTableA(6, 3, 4, 2)).toBe(9);
  });

  it('accurately verifies Table B lookups', () => {
    // Neck=1, Trunk=1, Legs=1 -> 1
    expect(lookupTableB(1, 1, 1)).toBe(1);
    // Neck=3, Trunk=2, Legs=2 -> 4
    expect(lookupTableB(3, 2, 2)).toBe(4);
    // Neck=4, Trunk=4, Legs=2 -> 7
    expect(lookupTableB(4, 4, 2)).toBe(7);
  });

  it('accurately verifies Table C lookups and Action Levels', () => {
    // ScoreA=1, ScoreB=1 -> Grand Score 1
    expect(lookupTableC(1, 1)).toBe(1);
    // ScoreA=3, ScoreB=4 -> Grand Score 4
    expect(lookupTableC(3, 4)).toBe(4);
    // ScoreA=7, ScoreB=7 -> Grand Score 7
    expect(lookupTableC(7, 7)).toBe(7);

    expect(scoreToActionLevel(1)).toBe(1);
    expect(scoreToActionLevel(4)).toBe(2);
    expect(scoreToActionLevel(5)).toBe(3);
    expect(scoreToActionLevel(7)).toBe(4);
  });

  it('refrains from issuing a Grand Score when required manual inputs are missing', () => {
    const incompleteInputs: ManualInputs = {
      forceLoad: null, // Missing!
      muscleUse: null, // Missing!
      wristTwist: 'mid_range',
      neckTwist: false,
      neckSideBend: false,
      trunkTwisted: false,
      trunkSideBend: false,
      upperArmAbducted: false,
      shoulderRaised: false,
      leaningArm: false,
      legsSupported: true,
    };

    const res = calculateRula(
      { upperArmDeg: 30, lowerArmDeg: 80, wristDeg: 0, neckDeg: 15, trunkDeg: 10 },
      incompleteInputs
    );

    expect(res.isComplete).toBe(false);
    expect(res.segmentScores.finalScore).toBeNull();
    expect(res.segmentScores.actionLevel).toBeNull();
    expect(res.missingInputFlags.length).toBeGreaterThan(0);
  });

  it('computes complete Grand Score and Action Level when all required inputs are present', () => {
    const completeInputs: ManualInputs = {
      forceLoad: 'none',
      muscleUse: 'occasional',
      wristTwist: 'mid_range',
      neckTwist: false,
      neckSideBend: false,
      trunkTwisted: false,
      trunkSideBend: false,
      upperArmAbducted: false,
      shoulderRaised: false,
      leaningArm: false,
      legsSupported: true,
    };

    const res = calculateRula(
      { upperArmDeg: 60, lowerArmDeg: 80, wristDeg: 10, neckDeg: 25, trunkDeg: 15 },
      completeInputs
    );

    expect(res.isComplete).toBe(true);
    expect(res.segmentScores.finalScore).not.toBeNull();
    expect(res.segmentScores.actionLevel).not.toBeNull();
    expect(res.missingInputFlags.length).toBe(0);
  });
});
