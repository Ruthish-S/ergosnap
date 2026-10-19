import React from 'react';
import type { Recommendation } from '../types/assessment';

interface EvidenceActionMatrixProps {
  recommendations: Recommendation[];
}

export const EvidenceActionMatrix: React.FC<EvidenceActionMatrixProps> = ({ recommendations }) => {
  // Classify recommendations into 2x2 matrix
  // High Impact + Easy Fix = Quick Wins (Immediate)
  // High Impact + Complex Fix = Major Projects
  // Low Impact + Easy Fix = Low-Hanging Fruit
  // Low Impact + Complex Fix = Low Priority / Re-evaluate

  // Assign implementation complexity based on keywords in suggestedAction
  const classifyComplexity = (rec: Recommendation): 'easy' | 'complex' => {
    const text = rec.suggestedAction.toLowerCase();
    if (
      text.includes('raise monitor') ||
      text.includes('lower chair') ||
      text.includes('reposition') ||
      text.includes('footrest') ||
      text.includes('adjust') ||
      text.includes('rotate')
    ) {
      return 'easy';
    }
    return 'complex'; // Requires structural redesign or equipment procurement
  };

  const quickWins: Recommendation[] = [];
  const majorProjects: Recommendation[] = [];
  const lowHangingFruit: Recommendation[] = [];
  const lowPriority: Recommendation[] = [];

  for (const rec of recommendations) {
    const isHighImpact = rec.priority === 'urgent' || rec.priority === 'high';
    const complexity = classifyComplexity(rec);

    if (isHighImpact && complexity === 'easy') {
      quickWins.push(rec);
    } else if (isHighImpact && complexity === 'complex') {
      majorProjects.push(rec);
    } else if (!isHighImpact && complexity === 'easy') {
      lowHangingFruit.push(rec);
    } else {
      lowPriority.push(rec);
    }
  }

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Corrective Action Priority Matrix (Severity vs. Implementation Feasibility)
          </h3>
          <p className="text-xs text-slate-500">
            Lean engineering prioritization mapping ergonomic risks against implementation complexity.
          </p>
        </div>
        <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
          Industrial ROI Matrix
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: Quick Wins (High Impact, High Feasibility) */}
        <div className="border-2 border-emerald-300 bg-emerald-50/40 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-emerald-900 uppercase tracking-wide">
              Quadrant I: Quick Wins (High Impact / Rapid Fix)
            </span>
            <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {quickWins.length} Actions
            </span>
          </div>
          <p className="text-[11px] text-emerald-800">
            Immediate implementation recommended — high biomechanical benefit with minimal capital expense.
          </p>

          <div className="space-y-2 mt-2">
            {quickWins.length > 0 ? (
              quickWins.map((rec) => (
                <div key={rec.id} className="bg-white p-2.5 rounded border border-emerald-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{rec.observation}</div>
                  <div className="text-slate-600 text-[11px]">
                    <strong>Fix:</strong> {rec.suggestedAction}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No items currently in this quadrant.</p>
            )}
          </div>
        </div>

        {/* Quadrant 2: Strategic Projects (High Impact, Complex Fix) */}
        <div className="border border-amber-300 bg-amber-50/40 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-amber-900 uppercase tracking-wide">
              Quadrant II: Strategic Redesigns (High Impact / Major Scope)
            </span>
            <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {majorProjects.length} Actions
            </span>
          </div>
          <p className="text-[11px] text-amber-800">
            Substantial risk reduction requiring workstation re-engineering, tooling change, or facility budget.
          </p>

          <div className="space-y-2 mt-2">
            {majorProjects.length > 0 ? (
              majorProjects.map((rec) => (
                <div key={rec.id} className="bg-white p-2.5 rounded border border-amber-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{rec.observation}</div>
                  <div className="text-slate-600 text-[11px]">
                    <strong>Fix:</strong> {rec.suggestedAction}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No items currently in this quadrant.</p>
            )}
          </div>
        </div>

        {/* Quadrant 3: Low-Hanging Fruit (Moderate Impact, Easy Fix) */}
        <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-blue-900 uppercase tracking-wide">
              Quadrant III: Housekeeping Adjustments (Moderate / Rapid Fix)
            </span>
            <span className="bg-blue-200 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {lowHangingFruit.length} Actions
            </span>
          </div>
          <p className="text-[11px] text-blue-800">
            Minor adjustments to ergonomic comfort envelopes; execute alongside regular maintenance.
          </p>

          <div className="space-y-2 mt-2">
            {lowHangingFruit.length > 0 ? (
              lowHangingFruit.map((rec) => (
                <div key={rec.id} className="bg-white p-2.5 rounded border border-blue-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{rec.observation}</div>
                  <div className="text-slate-600 text-[11px]">
                    <strong>Fix:</strong> {rec.suggestedAction}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No items currently in this quadrant.</p>
            )}
          </div>
        </div>

        {/* Quadrant 4: Low Priority (Low Impact, Complex Fix) */}
        <div className="border border-slate-200 bg-slate-50/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">
              Quadrant IV: Low Priority / Re-evaluate
            </span>
            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {lowPriority.length} Actions
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Disproportionate effort for marginal gain. Re-evaluate post-completion of Quadrants I and II.
          </p>

          <div className="space-y-2 mt-2">
            {lowPriority.length > 0 ? (
              lowPriority.map((rec) => (
                <div key={rec.id} className="bg-white p-2.5 rounded border border-slate-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{rec.observation}</div>
                  <div className="text-slate-600 text-[11px]">
                    <strong>Fix:</strong> {rec.suggestedAction}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No items currently in this quadrant.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
