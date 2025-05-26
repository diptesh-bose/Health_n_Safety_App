
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { GeminiService } from '../services/geminiService';
import { useFileHandler } from '../hooks/useFileHandler';
import FileInput from '../components/shared/FileInput';
import TextArea from '../components/shared/TextArea';
import Button from '../components/shared/Button';
import MarkdownRenderer from '../components/shared/MarkdownRenderer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { QAItem } from '../types';
import { Send, BookOpen, HelpCircle, Trash2, Info } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const AnalyzeRulesPage: React.FC = () => {
  const {
    regulationDocumentText, setRegulationDocumentText,
    regulationSummary, setRegulationSummary,
    regulationQAs, addRegulationQA, clearRegulationQAs,
    isLoading, setIsLoading, error, setError
  } = useAppStore();

  const [currentQuestion, setCurrentQuestion] = useState('');
  const { readFileAsText, fileError, resetHandler: resetFileHandler } = useFileHandler();
  const [fileGuidance, setFileGuidance] = useState<string | null>(null);

  useEffect(() => {
    setError(null); // Clear global error on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleFileSelected = async (file: File | null) => {
    setError(null); // Clear global error
    setFileGuidance(null); // Clear local file guidance
    setRegulationDocumentText(''); 
    setRegulationSummary('');
    clearRegulationQAs();
    resetFileHandler();

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
        setRegulationDocumentText(text);
        if (fileError) {
             setError(`Could not fully read file '${file.name}'. ${fileError} Please try copy-pasting the content or ensure it's a plain text file.`);
             setRegulationDocumentText(''); 
        }
      } catch (e: any) {
        setError(e.message || `Failed to read file '${file.name}'. Please ensure it's a plain text file or copy-paste its content.`);
        setRegulationDocumentText(''); 
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSummarize = async () => {
    if (!regulationDocumentText.trim()) {
      setError('Please upload or paste a regulation document first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFileGuidance(null);
    try {
      const summary = await GeminiService.summarizeText(regulationDocumentText);
      setRegulationSummary(summary);
    } catch (e: any) {
      setError(e.message || 'Failed to summarize document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!regulationDocumentText.trim()) {
      setError('Please upload or paste a regulation document to ask questions about it.');
      return;
    }
    if (!currentQuestion.trim()) {
      setError('Please enter a question.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFileGuidance(null);
    try {
      const answer = await GeminiService.answerQuestionAboutText(regulationDocumentText, currentQuestion);
      addRegulationQA({ id: uuidv4(), question: currentQuestion, answer });
      setCurrentQuestion('');
    } catch (e: any) {
      setError(e.message || 'Failed to get answer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-slate-800 mb-1">Analyze New Safety Rules</h2>
        <p className="text-sm text-slate-600 mb-4">Upload a safety regulation document, get an AI-generated summary, and ask questions for clarification.</p>
        
        <FileInput
          id="regulationFile"
          label="Upload Regulation Document"
          accept=".txt,.md,.pdf,.doc,.docx,.xlsx" 
          onChange={handleFileSelected}
          fileTypeHelpText="TXT, MD. For PDF, DOCX, XLSX: Please copy-paste relevant content into the text area below. Images within documents should be analyzed separately using 'Risk Detection' if needed."
        />
        
        {fileGuidance && (
          <div className="mt-2 p-3 bg-sky-50 border border-sky-300 text-sky-700 rounded-md text-sm flex items-start">
            <Info size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{fileGuidance}</span>
          </div>
        )}

        <TextArea
          id="regulationText"
          label="Or Paste Document Content Here"
          value={regulationDocumentText}
          onChange={(e) => {
            setRegulationDocumentText(e.target.value);
            if(e.target.value.trim()) {
                setError(null); 
                setFileGuidance(null); // Clear guidance when user types
            }
            if(!e.target.value.trim() && !isLoading) { 
                setRegulationSummary(''); 
                clearRegulationQAs(); 
            }
          }}
          placeholder="Paste the content of the safety regulation document here..."
          rows={8}
          className="mt-4"
        />
        <Button 
            onClick={handleSummarize} 
            isLoading={isLoading && !currentQuestion} 
            disabled={!regulationDocumentText.trim() || (isLoading && !!currentQuestion)} 
            className="mt-4" 
            icon={BookOpen}
        >
          Summarize Document
        </Button>
      </div>

      {isLoading && !regulationSummary && !regulationQAs.length && !currentQuestion && <LoadingSpinner message="Processing document..." />}

      {regulationSummary && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-slate-700 mb-3">Regulation Summary</h3>
          <MarkdownRenderer content={regulationSummary} />
        </div>
      )}

      {regulationDocumentText.trim() && ( 
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-slate-700 mb-3">Ask Questions about the Regulation</h3>
          <div className="space-y-2">
            <TextArea
              id="regulationQuestion"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="Type your question here..."
              rows={3}
            />
            <div className="flex justify-between items-center">
                <Button 
                    onClick={handleAskQuestion} 
                    isLoading={isLoading && !!currentQuestion} 
                    disabled={!currentQuestion.trim() || (isLoading && !currentQuestion)} 
                    icon={Send}
                >
                    Ask Copilot
                </Button>
                {regulationQAs.length > 0 && (
                    <Button onClick={() => { clearRegulationQAs(); setError(null); }} variant="secondary" icon={Trash2}>
                        Clear Q&A
                    </Button>
                )}
            </div>
          </div>

          {regulationQAs.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="text-lg font-semibold text-slate-700">Questions & Answers:</h4>
              {regulationQAs.map((qaItem) => (
                <div key={qaItem.id} className="p-4 border border-slate-200 rounded-md bg-slate-50">
                  <p className="font-semibold text-slate-700 flex items-center"><HelpCircle size={18} className="mr-2 text-sky-600"/>Q: {qaItem.question}</p>
                  <div className="mt-2 pl-2 border-l-2 border-sky-500">
                     <MarkdownRenderer content={qaItem.answer} className="bg-transparent shadow-none border-none p-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyzeRulesPage;
