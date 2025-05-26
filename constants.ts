
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-preview-04-17'; // Vision capabilities are part of general models

export const AppName = "H&S Safety Copilot";

export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: '1. Analyze Rules', path: '/analyze-rules' },
  { name: '2. Prepare Checklist', path: '/prepare-checklist' },
  { name: '3. Risk Detection', path: '/risk-detection' },
  { name: '4. Review Plan', path: '/review-plan' },
  { name: '5. Create Report', path: '/create-report' },
  { name: '6. Draft Email', path: '/draft-email' },
];

export const MOCK_CONTRACTORS = [
  { id: 'contractor-1', name: 'SafeBuild Construction Ltd.', safetyRating: 'A+' },
  { id: 'contractor-2', name: 'EnergyPipe Services Inc.', safetyRating: 'B' },
  { id: 'contractor-3', name: 'InfraSecure Solutions', safetyRating: 'A' },
];

export const DEFAULT_HS_PLAN_PROMPT = "Summarize the key health and safety measures, emergency procedures, and responsibilities outlined in this Health & Safety Plan.";
export const DEFAULT_SCOPE_OF_WORK_PROMPT = "Based on the provided Health &Safety Plan, summarize the contractor's scope of work relevant to on-site safety.";
export const DEFAULT_PLAN_VIOLATION_PROMPT = "Review this Health & Safety Plan summary: [PLAN_SUMMARY] and this Scope of Work summary: [SCOPE_SUMMARY]. Also consider these new regulations: [REGULATION_SUMMARY]. Identify any potential safety compliance gaps or violations in the contractor's plan or scope.";

