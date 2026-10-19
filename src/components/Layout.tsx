import React from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
  Upload,
  BarChart3,
  Activity,
  FileText,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';

export default function Layout() {
  const { session, dispatch, currentAssessment } = useAssessment();
  const location = useLocation();

  const handleReset = () => {
    if (window.confirm('Reset all assessment records in this session? This action cannot be undone.')) {
      dispatch({ type: 'RESET_SESSION' });
    }
  };

  const navItems = [
    {
      to: '/upload',
      label: 'Upload Posture',
      step: '01',
      icon: Upload,
      description: 'Image & view quality',
    },
    {
      to: currentAssessment ? `/analysis/${currentAssessment.assessmentId}` : '/upload',
      label: 'Pose & Inputs',
      step: '02',
      icon: Activity,
      description: 'Landmarks & muscle load',
      disabled: !currentAssessment && location.pathname !== '/upload',
    },
    {
      to: '/dashboard',
      label: 'Analytics Dashboard',
      step: '03',
      icon: BarChart3,
      description: '8-tab research panels',
      disabled: !currentAssessment,
    },
    {
      to: '/validation',
      label: 'Validation Engine',
      step: '04',
      icon: CheckCircle2,
      description: 'MAE & Kappa metrics',
      disabled: !currentAssessment,
    },
    {
      to: '/report',
      label: 'Technical PDF Report',
      step: '05',
      icon: FileText,
      description: '10-section publication',
      disabled: !currentAssessment,
    },
  ];

  const rulaScore = currentAssessment?.rulaAssessment?.segmentScores?.finalScore;
  const actionLevel = currentAssessment?.rulaAssessment?.segmentScores?.actionLevel;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-red-500 selection:text-white">
      {/* Demo Mode Banner */}
      {session.isDemoMode && (
        <aside aria-label="Demo Mode Notice" className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-4 py-1.5 text-xs font-semibold shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-slate-950" />
              <span>
                <strong>DEMO RESEARCH MODE:</strong> Displaying benchmark posture assessment. Results illustrate the computational pipeline and are not certified clinical determinations.
              </span>
            </div>
            <span className="hidden md:inline-flex items-center text-[10px] bg-slate-950/15 px-2 py-0.5 rounded font-mono">
              ISO 11226 / RULA Table C
            </span>
          </div>
        </aside>
      )}

      {/* Top Header */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-slate-950/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/upload" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-black text-white text-base tracking-wider shadow-md shadow-red-900/30 ring-1 ring-white/20 transition-transform group-hover:scale-105">
                ES
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-lg text-white">
                    ErgoSnap <span className="text-red-500 font-bold">Analytics</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-red-950 text-red-400 border border-red-800/60 px-1.5 py-0.5 rounded">
                    Research v1.2
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
                  Computer-Vision Ergonomic Posture Assessment & Reporting System
                </span>
              </div>
            </Link>
          </div>

          {/* Top Actions & Assessment Status Pill */}
          <div className="flex items-center space-x-3">
            {currentAssessment && (
              <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">Active Task:</span>
                <span className="font-semibold text-slate-200 max-w-[140px] truncate" title={currentAssessment.title}>
                  {currentAssessment.title}
                </span>
                {rulaScore !== null && rulaScore !== undefined && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    rulaScore >= 7
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : rulaScore >= 5
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    RULA {rulaScore}/7 (Level {actionLevel})
                  </span>
                )}
              </div>
            )}

            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-slate-300 text-[11px]">Private Client Sandbox (Zero Cloud Transit)</span>
            </div>

            {session.assessments.length > 0 && (
              <button
                onClick={handleReset}
                title="Reset Session and clear loaded evaluations"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">New Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Workflow Stepper Navigation */}
        <nav aria-label="Workflow Navigation" className="bg-slate-900 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-red-600 text-white shadow-sm shadow-red-600/30 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/25 text-white/80 font-bold">
                      {item.step}
                    </span>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                  {idx < navItems.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-700 shrink-0 hidden md:inline-block" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
            <div>
              <strong className="text-slate-700">ErgoSnap Analytics</strong> — Academic Production Engineering Platform
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>Based on McAtamney & Corlett (1993) & ISO 11226:2000</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>MediaPipe Pose Vision</span>
            </span>
            <span>•</span>
            <a
              href="https://github.com/Ruthish-S/ergosnap"
              target="_blank"
              rel="noreferrer"
              className="text-red-600 hover:text-red-700 font-semibold hover:underline"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
