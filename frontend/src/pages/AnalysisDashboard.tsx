import { useLocation, useNavigate } from "react-router";
import AnalysisResults from "../components/AnalysisResults";

export default function AnalysisDashboard() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </button>
      <AnalysisResults analysisData={state?.analysisData ?? null} isLoading={false} />
    </div>
  );
}
