
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { GeminiService } from '../services/geminiService';
import TextArea from '../components/shared/TextArea';
import Button from '../components/shared/Button';
import MarkdownRenderer from '../components/shared/MarkdownRenderer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { MailWarning, Send, Edit3 } from 'lucide-react';

const DraftEmailPage: React.FC = () => {
  const {
    violationsSummaryForEmail, // Populated from CreateReportPage
    urgentEmailDraft, setUrgentEmailDraft,
    isLoading, setIsLoading, error, setError
  } = useAppStore();

  const [recipient, setRecipient] = useState('Head of H&S');

  useEffect(() => {
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDraftEmail = async () => {
    if (!violationsSummaryForEmail) {
      setError('No violations summary available. Please generate a safety report first, or manually input a summary.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const email = await GeminiService.draftUrgentEmail(violationsSummaryForEmail, recipient);
      setUrgentEmailDraft(email);
    } catch (e: any) {
      setError(e.message || 'Failed to draft email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-slate-800 mb-1">Draft Urgent Safety Email</h2>
        <p className="text-sm text-slate-600 mb-4">Based on the identified safety violations (summary typically from "Create Report" page), Copilot will help draft an urgent email.</p>

        <div className="mb-4">
          <label htmlFor="recipient" className="block text-sm font-medium text-slate-700 mb-1">Recipient</label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder="e.g., Head of H&S, Project Manager"
          />
        </div>
        
        <TextArea
          id="violationsSummary"
          label="Violations Summary (Pre-filled from report, or enter manually)"
          value={violationsSummaryForEmail} // This should be editable if user wants to override
          onChange={(e) => useAppStore.setState({ violationsSummaryForEmail: e.target.value })}
          placeholder="Enter a bulleted list or summary of critical safety violations here..."
          rows={6}
          className="mb-4"
        />

        {!violationsSummaryForEmail && (
             <div className="p-3 mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                <p className="font-bold">Violations Summary Missing</p>
                <p>It's recommended to generate a safety report first on the "Create Report" page. The violations summary will be pre-filled. Alternatively, you can type it manually above.</p>
            </div>
        )}


        <Button 
            onClick={handleDraftEmail} 
            isLoading={isLoading} 
            disabled={!violationsSummaryForEmail || isLoading}
            className="mt-4"
            icon={MailWarning}
        >
          Draft Urgent Email with AI
        </Button>
      </div>

      {isLoading && <LoadingSpinner message="Drafting email..." />}

      {urgentEmailDraft && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center">
            <Edit3 size={22} className="mr-2 text-sky-600"/>
            Draft Email (Editable)
            </h3>
          {/* Using TextArea to allow easy copy-pasting and editing by the user */}
          <TextArea
            id="draftEmailArea"
            value={urgentEmailDraft}
            onChange={(e) => setUrgentEmailDraft(e.target.value)}
            rows={15}
            className="font-mono text-sm"
          />
          <p className="mt-2 text-xs text-slate-500">Review and edit the AI-generated email draft before sending.</p>
        </div>
      )}
    </div>
  );
};

export default DraftEmailPage;
