import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  Upload,
  BarChart2,
  Activity,
  FileText,
  CheckSquare,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';

export default function Layout() {
  const { session, dispatch, currentAssessment } = useAssessment();

  const handleReset = () => {
    if (window.confirm('Reset all assessment records in this session? This action cannot be undone.')) {
      dispatch({ type: 'RESET_SESSION' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Demo Mode Banner */}
      {session.isDemoMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>DEMO MODE ACTIVE:</strong> Sample assessment demonstrating analysis workflow.
              Results are for academic exploration and do not constitute certified ergonomic findings.
            </span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-[#1A1A2E] text-white border-b-2 border-red-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/upload" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center font-bold text-white text-base tracking-wider shadow-sm">
                ES
              </div>
              <div>
                <span className="font-bold tracking-tight text-base sm:text-lg text-white">
                  ErgoSnap <span className="text-red-500 font-semibold">Analytics</span>
                </span>
                <span className="hidden md:inline-block ml-2 text-xs text-slate-400 border-l border-slate-700 pl-2">
                  Computer-Vision Ergonomic Engineering
                </span>
              </div>
            </Link>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Local Browser Processing (Zero Cloud Upload)</span>
            </div>

            {session.assessments.length > 0 && (
              <button
                onClick={handleReset}
                title="Reset Session"
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="bg-[#151525] border-t border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-4 overflow-x-auto py-1">
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Upload className="w-4 h-4" />
              <span>1. Upload</span>
            </NavLink>

            <NavLink
              to={currentAssessment ? `/analysis/${currentAssessment.assessmentId}` : '/upload'}
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Activity className="w-4 h-4" />
              <span>2. Pose & Inputs</span>
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <BarChart2 className="w-4 h-4" />
              <span>3. Dashboard</span>
            </NavLink>

            <NavLink
              to="/validation"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <CheckSquare className="w-4 h-4" />
              <span>4. Validation</span>
            </NavLink>

            <NavLink
              to="/report"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <FileText className="w-4 h-4" />
              <span>5. PDF Report</span>
            </NavLink>
          </div>
        </nav>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <strong>ErgoSnap Analytics v1.0.0</strong> — Production Engineering Research Prototype
            (McAtamney & Corlett 1993 RULA Implementation).
          </div>
          <div className="flex items-center gap-3">
            <span>Client-side inference via MediaPipe Pose</span>
            <span>•</span>
            <a
              href="https://github.com/Ruthish-S/ergosnap"
              target="_blank"
              rel="noreferrer"
              className="text-red-600 hover:underline font-medium"
            >
              GitHub Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
