
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { GeminiService } from '../services/geminiService';
import { useFileHandler } from '../hooks/useFileHandler';
import FileInput from '../components/shared/FileInput';
import TextArea from '../components/shared/TextArea';
import Button from '../components/shared/Button';
import MarkdownRenderer from '../components/shared/MarkdownRenderer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Contractor } from '../types';
import { MOCK_CONTRACTORS, DEFAULT_HS_PLAN_PROMPT, DEFAULT_SCOPE_OF_WORK_PROMPT, DEFAULT_PLAN_VIOLATION_PROMPT } from '../constants';
import { Users, FileSearch, AlertTriangle, ChevronDown, Info } from 'lucide-react';
import { dbService } from '../services/dbService';

const ReviewSafetyPlanPage: React.FC = () => {
  const {
    selectedContractor, setSelectedContractor,
    contractorSafetyPlanText, setContractorSafetyPlanText,
    contractorSafetyPlanSummary, setContractorSafetyPlanSummary,
    contractorScopeOfWorkSummary, setContractorScopeOfWorkSummary,
    contractorPlanViolations, setContractorPlanViolations,
    regulationSummary, 
    isLoading, setIsLoading, error, setError
  } = useAppStore();

  const { readFileAsText, fileError, resetHandler: resetFileHandler } = useFileHandler();
  const [isContractorDropdownOpen, setIsContractorDropdownOpen] = useState(false);
  const [fileGuidance, setFileGuidance] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);


 useEffect(() => {
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelected = async (file: File | null) => {
    setError(null);
    setFileGuidance(null);
    setContractorSafetyPlanText(''); 
    resetFileHandler();
    setCurrentFileName(file?.name || null);


    if (file) {
      const fileName = file.name.toLowerCase();
      const complexFormats = ['.pdf', '.doc', '.docx', '.xlsx'];
      const isComplexFormat = complexFormats.some(ext => fileName.endsWith(ext));

      if (isComplexFormat) {
        setFileGuidance(
          `For ${file.name.split('.').pop()?.toUpperCase()} files, direct text analysis is not supported. Please open the file, then copy and paste the relevant text content into the text area below for analysis.`
        );
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const text = await readFileAsText(file);
        setContractorSafetyPlanText(text);
         if (fileError) { 
             setError(`Could not fully read file '${file.name}'. ${fileError} Please try copy-pasting the content or ensure it's a plain text file.`);
             setContractorSafetyPlanText('');
        } else {
            try {
                await dbService.addAuditLog({
                  timestamp: new Date(),
                  actionType: 'FILE_CONTENT_EXTRACTED',
                  details: {
                    page: 'ReviewSafetyPlanPage',
                    contractorName: selectedContractor?.name,
                    fileName: file.name,
                    extractedTextLength: text.length,
                  }
                });
              } catch (logError) {
                console.warn("Failed to write audit log for H&S plan file extraction:", logError);
              }
        }
      } catch (e: any) {
        setError(e.message || `Failed to read H&S plan file '${file.name}'. Please ensure it's a plain text file or copy-paste its content.`);
        setContractorSafetyPlanText('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectContractor = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setContractorSafetyPlanText('');
    setContractorSafetyPlanSummary('');
    setContractorScopeOfWorkSummary('');
    setContractorPlanViolations('');
    resetFileHandler();
    setError(null);
    setFileGuidance(null);
    setCurrentFileName(null);
    setIsContractorDropdownOpen(false); 
  };

  const handleAnalyzePlan = async () => {
    if (!contractorSafetyPlanText.trim()) {
      setError('Please upload or paste the contractor H&S plan first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFileGuidance(null);
    try {
      const planSummary = await GeminiService.summarizeDocumentWithFocus(contractorSafetyPlanText, DEFAULT_HS_PLAN_PROMPT);
      setContractorSafetyPlanSummary(planSummary);

      const scopeSummary = await GeminiService.summarizeDocumentWithFocus(contractorSafetyPlanText, DEFAULT_SCOPE_OF_WORK_PROMPT);
      setContractorScopeOfWorkSummary(scopeSummary);
      
      let violationPrompt = DEFAULT_PLAN_VIOLATION_PROMPT
        .replace('[PLAN_SUMMARY]', planSummary)
        .replace('[SCOPE_SUMMARY]', scopeSummary)
        .replace('[REGULATION_SUMMARY]', regulationSummary || "No specific new regulation summary provided by user for this check.");
      
      const violations = await GeminiService.summarizeDocumentWithFocus(violationPrompt, "Identify potential safety compliance gaps or violations based on the provided information.");
      setContractorPlanViolations(violations);

      try {
        await dbService.addAuditLog({
          timestamp: new Date(),
          actionType: 'CONTRACTOR_PLAN_ANALYZED',
          details: {
            page: 'ReviewSafetyPlanPage',
            contractorName: selectedContractor?.name,
            fileName: currentFileName,
            planTextLength: contractorSafetyPlanText.length,
            planSummaryLength: planSummary.length,
            scopeSummaryLength: scopeSummary.length,
            violationsIdentifiedLength: violations.length,
            regulationSummaryUsed: !!regulationSummary,
          }
        });
      } catch (logError) {
        console.warn("Failed to write audit log for contractor plan analysis:", logError);
      }

    } catch (e: any)      {
      setError(e.message || 'Failed to analyze contractor plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-slate-800 mb-1">Review Contractor H&S Safety Plan</h2>
        <p className="text-sm text-slate-600 mb-4">Select a contractor, upload their H&S plan, and Copilot will help summarize it, define the scope of work, and identify potential safety violations.</p>

        <div className="mb-4">
            <label htmlFor="contractorSelect" className="block text-sm font-medium text-slate-700 mb-1">Select Contractor</label>
            <div className="relative">
                <button
                    type="button"
                    className="bg-white relative w-full border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    onClick={() => setIsContractorDropdownOpen(!isContractorDropdownOpen)}
                    aria-haspopup="listbox"
                    aria-expanded={isContractorDropdownOpen}
                >
                    <span className="block truncate">{selectedContractor ? selectedContractor.name : "Select a contractor"}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </span>
                </button>
                {isContractorDropdownOpen && (
                    <ul
                        className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                        role="listbox"
                        aria-labelledby="contractorSelect"
                    >
                        {MOCK_CONTRACTORS.map((contractor) => (
                            <li
                                key={contractor.id}
                                className="text-slate-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-sky-100"
                                onClick={() => handleSelectContractor(contractor)}
                                role="option"
                                aria-selected={selectedContractor?.id === contractor.id}
                            >
                                <span className={`font-normal block truncate ${selectedContractor?.id === contractor.id ? 'font-semibold' : ''}`}>{contractor.name} (Rating: {contractor.safetyRating})</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>


        {selectedContractor && (
          <>
            <FileInput
              id="contractorPlanFile"
              label={`Upload H&S Plan for ${selectedContractor.name}`}
              accept=".txt,.md,.pdf,.doc,.docx,.xlsx"
              onChange={handleFileSelected}
              fileTypeHelpText="TXT, MD. For PDF, DOCX, XLSX: Please copy-paste relevant content. Images within documents should be analyzed separately using 'Risk Detection' if needed."
            />
            
            {fileGuidance && (
              <div className="mt-2 p-3 bg-sky-50 border border-sky-300 text-sky-700 rounded-md text-sm flex items-start">
                <Info size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                <span>{fileGuidance}</span>
              </div>
            )}

            <TextArea
              id="contractorPlanText"
              label="Or Paste H&S Plan Content Here"
              value={contractorSafetyPlanText}
              onChange={(e) => {
                setContractorSafetyPlanText(e.target.value);
                if(e.target.value.trim()) {
                    setError(null);
                    setFileGuidance(null); 
                    setCurrentFileName(null); // Pasted content
                }
                if(!e.target.value.trim() && !isLoading) {
                    setContractorSafetyPlanSummary('');
                    setContractorScopeOfWorkSummary('');
                    setContractorPlanViolations('');
                }
              }}
              placeholder={`Paste H&S plan for ${selectedContractor.name}...`}
              rows={8}
              className="mt-4"
            />
            <Button 
                onClick={handleAnalyzePlan} 
                isLoading={isLoading} 
                disabled={!contractorSafetyPlanText.trim() || isLoading} 
                className="mt-4"
                icon={FileSearch}
            >
              Analyze Plan & Identify Risks
            </Button>
          </>
        )}
      </div>

      {isLoading && !contractorSafetyPlanSummary && <LoadingSpinner message="Analyzing contractor H&S plan..." />}

      {contractorSafetyPlanSummary && (
        <div className="p-6 bg-white rounded-lg shadow mt-6">
          <h3 className="text-xl font-semibold text-slate-700 mb-3">H&S Plan Summary</h3>
          <MarkdownRenderer content={contractorSafetyPlanSummary} />
        </div>
      )}

      {contractorScopeOfWorkSummary && (
        <div className="p-6 bg-white rounded-lg shadow mt-6">
          <h3 className="text-xl font-semibold text-slate-700 mb-3">Scope of Work Summary (from Plan)</h3>
          <MarkdownRenderer content={contractorScopeOfWorkSummary} />
        </div>
      )}

      {contractorPlanViolations && (
        <div className="p-6 bg-orange-50 border-l-4 border-orange-500 rounded-lg shadow mt-6">
          <h3 className="text-xl font-semibold text-orange-700 mb-3 flex items-center">
            <AlertTriangle size={22} className="mr-2"/>
            Potential Safety Violations / Compliance Gaps
            </h3>
          <MarkdownRenderer content={contractorPlanViolations} className="bg-transparent shadow-none border-none p-0"/>
        </div>
      )}
    </div>
  );
};

export default ReviewSafetyPlanPage;
