
export interface QAItem {
  id: string;
  question: string;
  answer: string;
}

export interface SiteImage {
  id: string;
  file?: File;
  fileName: string;
  base64: string;
  mimeType: string;
  analysis: string;
}

export interface Contractor {
  id: string;
  name: string;
  safetyRating: string; 
  projectSafetyPlanContent?: string; // Content of their safety plan
}

export interface PageContent {
  title: string;
  description: string;
  path: string;
  icon?: React.ElementType;
}

export interface AppStoreState {
  // Scenario 1: Analyze Rules
  regulationDocumentText: string;
  setRegulationDocumentText: (text: string) => void;
  regulationSummary: string;
  setRegulationSummary: (summary: string) => void;
  regulationQAs: QAItem[];
  addRegulationQA: (qa: QAItem) => void;
  clearRegulationQAs: () => void;

  // Scenario 2: Prepare Checklist
  existingChecklist: string;
  setExistingChecklist: (checklist: string) => void;
  updatedChecklist: string;
  setUpdatedChecklist: (checklist: string) => void;

  // Scenario 3: H&S Risk Detection
  siteImage: SiteImage | null;
  setSiteImage: (image: SiteImage | null) => void;
  appendImageToNotes: (image: SiteImage) => void; 

  // Scenario 4: Review Contractor's H&S Safety Plan
  selectedContractor: Contractor | null;
  setSelectedContractor: (contractor: Contractor | null) => void;
  contractorSafetyPlanText: string; // content of uploaded/fetched plan
  setContractorSafetyPlanText: (text: string) => void;
  contractorSafetyPlanSummary: string;
  setContractorSafetyPlanSummary: (summary: string) => void;
  contractorScopeOfWorkSummary: string;
  setContractorScopeOfWorkSummary: (summary: string) => void;
  contractorPlanViolations: string; // AI identified violations as text
  setContractorPlanViolations: (violations: string) => void;

  // Scenario 5: Create Safety Violations Report
  safetyReport: string;
  setSafetyReport: (report: string) => void;
  inspectionNotes: string; // General notes, including image analysis
  setInspectionNotes: (notes: string) => void;


  // Scenario 6: Draft Urgent Email
  urgentEmailDraft: string;
  setUrgentEmailDraft: (email: string) => void;
  violationsSummaryForEmail: string;
  setViolationsSummaryForEmail: (summary: string) => void;

  // Global loading/error
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export interface AuditLogEntry {
  id?: number; // Auto-incremented by IndexedDB
  timestamp: Date;
  actionType: string; // e.g., 'REGULATION_SUMMARY_GENERATED', 'IMAGE_RISK_ANALYZED'
  details: Record<string, any>; // Flexible object for event-specific data
}
