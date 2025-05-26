
import {create} from 'zustand';
import { AppStoreState, QAItem, SiteImage, Contractor } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useAppStore = create<AppStoreState>((set, get) => ({
  // Scenario 1
  regulationDocumentText: '',
  setRegulationDocumentText: (text) => set({ regulationDocumentText: text }),
  regulationSummary: '',
  setRegulationSummary: (summary) => set({ regulationSummary: summary }),
  regulationQAs: [],
  addRegulationQA: (qa) => set((state) => ({ regulationQAs: [...state.regulationQAs, { ...qa, id: uuidv4() }] })),
  clearRegulationQAs: () => set({ regulationQAs: [] }),

  // Scenario 2
  existingChecklist: '',
  setExistingChecklist: (checklist) => set({ existingChecklist: checklist }),
  updatedChecklist: '',
  setUpdatedChecklist: (checklist) => set({ updatedChecklist: checklist }),

  // Scenario 3
  siteImage: null,
  setSiteImage: (image) => set({ siteImage: image }),
  appendImageToNotes: (imageWithAnalysis) => {
    const currentNotes = get().inspectionNotes;
    const imageNote = `\n\n--- Image Analysis (${imageWithAnalysis.fileName || 'Uploaded Image'}) ---\n${imageWithAnalysis.analysis}\n--- End Image Analysis ---`;
    set({ inspectionNotes: currentNotes + imageNote });
  },


  // Scenario 4
  selectedContractor: null,
  setSelectedContractor: (contractor) => set({ selectedContractor: contractor }),
  contractorSafetyPlanText: '',
  setContractorSafetyPlanText: (text) => set({ contractorSafetyPlanText: text }),
  contractorSafetyPlanSummary: '',
  setContractorSafetyPlanSummary: (summary) => set({ contractorSafetyPlanSummary: summary }),
  contractorScopeOfWorkSummary: '',
  setContractorScopeOfWorkSummary: (summary) => set({ contractorScopeOfWorkSummary: summary }),
  contractorPlanViolations: '',
  setContractorPlanViolations: (violations) => set({ contractorPlanViolations: violations }),

  // Scenario 5
  safetyReport: '',
  setSafetyReport: (report) => set({ safetyReport: report }),
  inspectionNotes: '', // General notes for report
  setInspectionNotes: (notes) => set({ inspectionNotes: notes }),
  
  // Scenario 6
  urgentEmailDraft: '',
  setUrgentEmailDraft: (email) => set({ urgentEmailDraft: email }),
  violationsSummaryForEmail: '',
  setViolationsSummaryForEmail: (summary) => set({ violationsSummaryForEmail: summary }),

  // Global
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (errorMsg) => set({ error: errorMsg }),
}));
