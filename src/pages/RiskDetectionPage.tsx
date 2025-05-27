
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { GeminiService } from '../services/geminiService';
import { useFileHandler } from '../hooks/useFileHandler';
import FileInput from '../components/shared/FileInput';
import TextArea from '../components/shared/TextArea';
import Button from '../components/shared/Button';
import MarkdownRenderer from '../components/shared/MarkdownRenderer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { SiteImage } from '../types';
import { Eye, Camera, FilePlus, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { dbService } from '../services/dbService';

const RiskDetectionPage: React.FC = () => {
  const {
    siteImage, setSiteImage, appendImageToNotes,
    isLoading, setIsLoading, error, setError
  } = useAppStore();
  
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>("Describe this image focusing on potential safety hazards. Identify any unsafe acts or conditions, particularly concerning work near high voltage equipment if visible.");
  const { readFileAsBase64, fileError, resetHandler: resetFileHandler } = useFileHandler();

  useEffect(() => {
    setError(null);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelected = (file: File | null) => {
    setError(null);
    setCurrentImageFile(file);
    if (!file) {
      setSiteImage(null); // Clear existing image data if file is removed
      resetFileHandler();
    }
  };

  const handleAnalyzeImage = async () => {
    if (!currentImageFile) {
      setError('Please upload an image first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const base64Data = await readFileAsBase64(currentImageFile);
      const analysis = await GeminiService.analyzeImageForSafety(base64Data, currentImageFile.type, imagePrompt);
      
      const newImage: SiteImage = {
        id: uuidv4(),
        file: currentImageFile,
        fileName: currentImageFile.name,
        base64: base64Data,
        mimeType: currentImageFile.type,
        analysis: analysis,
      };
      setSiteImage(newImage);
      try {
        await dbService.addAuditLog({
          timestamp: new Date(),
          actionType: 'IMAGE_RISK_ANALYZED',
          details: {
            page: 'RiskDetectionPage',
            fileName: currentImageFile.name,
            mimeType: currentImageFile.type,
            analysisLength: analysis.length,
            promptUsed: imagePrompt
          }
        });
      } catch (logError) {
        console.warn("Failed to write audit log for image analysis:", logError);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to analyze image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImageToNotes = () => {
    if(siteImage && siteImage.analysis) {
        appendImageToNotes(siteImage);
        alert("Image and analysis added to inspection notes (view in Create Report section).");
        try {
            dbService.addAuditLog({ // Log this action too, as it modifies InspectionNotes
              timestamp: new Date(),
              actionType: 'IMAGE_ANALYSIS_APPENDED_TO_NOTES',
              details: {
                page: 'RiskDetectionPage',
                fileName: siteImage.fileName,
                analysisLength: siteImage.analysis.length,
              }
            });
          } catch (logError) {
            console.warn("Failed to write audit log for appending image analysis to notes:", logError);
          }
    } else {
        setError("No image analysis available to add to notes.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-slate-800 mb-1">H&S Risk Detection from Image</h2>
        <p className="text-sm text-slate-600 mb-4">Upload an image of a worksite. Copilot will analyze it for potential safety hazards.</p>

        <FileInput
          id="siteImageFile"
          label="Upload Worksite Image"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileSelected}
          fileTypeHelpText="PNG, JPG, WEBP files."
        />
        {fileError && <p className="text-sm text-red-500 mt-1">{fileError}</p>}

        {currentImageFile && (
          <img 
            src={URL.createObjectURL(currentImageFile)} 
            alt="Worksite preview" 
            className="mt-4 rounded-md shadow-md max-h-80 object-contain" 
          />
        )}

        <TextArea
          id="imagePrompt"
          label="Analysis Prompt (Optional)"
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="e.g., Identify fall hazards and PPE compliance issues."
          rows={3}
          className="mt-4"
        />
        <Button 
            onClick={handleAnalyzeImage} 
            isLoading={isLoading} 
            disabled={!currentImageFile || isLoading} 
            className="mt-4"
            icon={Eye}
        >
          Analyze Image with AI
        </Button>
      </div>

      {isLoading && <LoadingSpinner message="Analyzing image..." />}

      {siteImage?.analysis && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center">
            <AlertTriangle size={22} className="mr-2 text-orange-500"/>
            AI Image Analysis
            </h3>
          {siteImage.base64 && currentImageFile && (
             <img 
                src={`data:${siteImage.mimeType};base64,${siteImage.base64}`} 
                alt={siteImage.fileName}
                className="mb-4 rounded-md shadow-md max-h-80 object-contain" 
            />
          )}
          <MarkdownRenderer content={siteImage.analysis} />
          <Button 
            onClick={handleAddImageToNotes} 
            disabled={!siteImage?.analysis} 
            className="mt-4"
            icon={FilePlus}
            variant="secondary"
            >
            Add to Inspection Notes
          </Button>
        </div>
      )}
    </div>
  );
};

export default RiskDetectionPage;
