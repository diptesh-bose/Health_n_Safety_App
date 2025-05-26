
import React, { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { GeminiService } from '../services/geminiService';
import TextArea from '../components/shared/TextArea';
import Button from '../components/shared/Button';
import MarkdownRenderer from '../components/shared/MarkdownRenderer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { ListChecks, Edit3 } from 'lucide-react';

const PrepareChecklistPage: React.FC = () => {
  const {
    existingChecklist, setExistingChecklist,
    updatedChecklist, setUpdatedChecklist,
    regulationSummary, // Use summary from AnalyzeRulesPage
    isLoading, setIsLoading, error, setError
  } = useAppStore();

  useEffect(() => {
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateChecklist = async () => {
    if (!existingChecklist) {
      setError('Please provide the existing safety checklist.');
      return;
    }
    if (!regulationSummary) {
      setError('Please analyze a regulation document first (on "Analyze Rules" page) to get a summary for updating the checklist.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newChecklist = await GeminiService.updateChecklistWithRegulations(existingChecklist, regulationSummary);
      setUpdatedChecklist(newChecklist);
    } catch (e: any) {
      setError(e.message || 'Failed to update checklist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-slate-800 mb-1">Prepare Safety Checklist</h2>
        <p className="text-sm text-slate-600 mb-4">Input your existing safety checklist and use the AI-generated regulation summary (from "Analyze Rules" page) to update it for compliance.</p>

        {!regulationSummary && (
          <div className="p-4 mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p className="font-bold">Regulation Summary Missing</p>
            <p>Please go to the "Analyze Rules" page and generate a summary for a safety regulation document first. This summary will be used to update your checklist.</p>
          </div>
        )}

        <TextArea
          id="existingChecklist"
          label="Existing Safety Checklist"
          value={existingChecklist}
          onChange={(e) => setExistingChecklist(e.target.value)}
          placeholder="Paste your current safety checklist here..."
          rows={10}
        />
        {regulationSummary && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
                <h4 className="font-semibold text-slate-700">Using Regulation Summary:</h4>
                <p className="text-xs text-slate-600 truncate hover:whitespace-normal focus:whitespace-normal" tabIndex={0}>{regulationSummary || "No summary available. Please generate one on the 'Analyze Rules' page."}</p>
            </div>
        )}
        <Button 
          onClick={handleUpdateChecklist} 
          isLoading={isLoading} 
          disabled={!existingChecklist || !regulationSummary || isLoading} 
          className="mt-4"
          icon={ListChecks}
        >
          Update Checklist with AI
        </Button>
      </div>

      {isLoading && <LoadingSpinner message="Updating checklist..." />}

      {updatedChecklist && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center">
            <Edit3 size={22} className="mr-2 text-sky-600"/>
            AI-Updated Checklist (Editable)
            </h3>
          <TextArea
            id="updatedChecklistArea"
            value={updatedChecklist}
            onChange={(e) => setUpdatedChecklist(e.target.value)}
            rows={15}
            className="font-mono text-sm"
          />
          <p className="mt-2 text-xs text-slate-500">Review and edit the AI-generated checklist as needed.</p>
        </div>
      )}
    </div>
  );
};

export default PrepareChecklistPage;
