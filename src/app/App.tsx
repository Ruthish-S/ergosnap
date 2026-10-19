import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import UploadPage from '../pages/UploadPage';
import AnalysisPage from '../pages/AnalysisPage';
import DashboardPage from '../pages/DashboardPage';
import ValidationPage from '../pages/ValidationPage';
import ReportPage from '../pages/ReportPage';
import { AssessmentProvider } from '../context/AssessmentContext';

export default function App() {
  return (
    <AssessmentProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/analysis/:assessmentId" element={<AnalysisPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/validation" element={<ValidationPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AssessmentProvider>
  );
}
