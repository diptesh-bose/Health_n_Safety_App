
import React, { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { GeminiService } from '../services/geminiService';
import TextArea from '../components/shared/TextArea';
import Button from '../components/shared/Button';
import MarkdownRenderer from '../components/shared/MarkdownRenderer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { FileWarning, Edit3 } from 'lucide-react';
import { dbService } from '../services/dbService';

const CreateReportPage: React.FC = () => {
  const {
    updatedChecklist, // From PrepareChecklistPage
    inspectionNotes, setInspectionNotes, // Includes image analysis from RiskDetectionPage
    contractorScopeOfWorkSummary, // From ReviewSafetyPlanPage
    contractorPlanViolations, // From ReviewSafetyPlanPage for additional context
    safetyReport, setSafetyReport,
    setViolationsSummaryForEmail, // To pass to draft email page
    isLoading, setIsLoading, error, setError
  } = useAppStore();

  useEffect(() => {
    setError(null);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateReport = async () => {
    if (!updatedChecklist && !inspectionNotes && !contractorScopeOfWorkSummary && !contractorPlanViolations) {
      setError('Not enough information to generate a report. Please complete previous steps like checklist updates, risk detection, or plan review.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const reportContent = await GeminiService.generateSafetyReport(
        updatedChecklist || "No checklist available.",
        `${inspectionNotes || "No specific inspection notes."}\n\nContractor Plan Violations (if any):\n${contractorPlanViolations || "No specific contractor plan violations noted."}`,
        contractorScopeOfWorkSummary || "No scope of work summary available.",
        [] // siteImage analyses are now part of inspectionNotes
      );
      setSafetyReport(reportContent);
      
      const violationsForEmailPrompt = `From the following safety report, extract a concise bulleted list of the most critical safety violations only:\n\n${reportContent}`;
      const emailSummary = await GeminiService.summarizeDocumentWithFocus(reportContent, violationsForEmailPrompt);
      setViolationsSummaryForEmail(emailSummary);

      try {
        await dbService.addAuditLog({
          timestamp: new Date(),
          actionType: 'SAFETY_REPORT_GENERATED',
          details: {
            page: 'CreateReportPage',
            reportLength: reportContent.length,
            violationsSummaryForEmailLength: emailSummary.length,
            sources: {
              checklistAvailable: !!updatedChecklist,
              inspectionNotesLength: inspectionNotes?.length || 0,
              contractorScopeAvailable: !!contractorScopeOfWorkSummary,
              contractorViolationsAvailable: !!contractorPlanViolations,
            }
          }
        });
      } catch (logError) {
        console.warn("Failed to write audit log for safety report generation:", logError);
      }

    } catch (e: any) {
      setError(e.message || 'Failed to generate safety report.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const anyInputAvailable = updatedChecklist || inspectionNotes || contractorScopeOfWorkSummary || contractorPlanViolations;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-slate-800 mb-1">Create Safety Violations Report</h2>
        <p className="text-sm text-slate-600 mb-4">Consolidate findings from your inspection (checklist, notes, image analysis, plan review) into a draft safety violations report.</p>

        <TextArea
            id="inspectionNotes"
            label="Additional Inspection Notes (Image analysis automatically appended here)"
            value={inspectionNotes}
            onChange={(e) => setInspectionNotes(e.target.value)}
            placeholder="Add any overall notes, observations, or specific violation details here..."
            rows={8}
            className="mb-4"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-slate-50 border rounded-md">
                <h4 className="font-semibold text-sm text-slate-700">Checklist Available:</h4>
                <p className="text-xs text-slate-500">{updatedChecklist ? "Yes, updated checklist will be used." : "No, please complete 'Prepare Checklist'."}</p>
            </div>
            <div className="p-3 bg-slate-50 border rounded-md">
                <h4 className="font-semibold text-sm text-slate-700">Contractor Plan Info:</h4>
                <p className="text-xs text-slate-500">{(contractorScopeOfWorkSummary || contractorPlanViolations) ? "Yes, scope and/or violations will be used." : "No, consider 'Review Plan'."}</p>
            </div>
        </div>


        <Button 
            onClick={handleGenerateReport} 
            isLoading={isLoading} 
            disabled={!anyInputAvailable || isLoading}
            className="mt-4"
            icon={FileWarning}
        >
          Generate Violations Report with AI
        </Button>
      </div>

      {isLoading && <LoadingSpinner message="Generating safety report..." />}

      {safetyReport && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center">
            <Edit3 size={22} className="mr-2 text-sky-600"/>
            Draft Safety Violations Report (Editable)
            </h3>
           <TextArea
            id="safetyReportArea"
            value={safetyReport}
            onChange={(e) => setSafetyReport(e.target.value)}
            rows={20}
            className="font-mono text-sm"
          />
           <p className="mt-2 text-xs text-slate-500">Review and edit the AI-generated report. This will also be used to pre-fill violation summaries for the email draft.</p>
        </div>
      )}
    </div>
  );
};

export default CreateReportPage;
