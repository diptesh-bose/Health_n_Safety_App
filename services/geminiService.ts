
import { GoogleGenAI, GenerateContentResponse, Part, Content } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL } from '../constants';

// API key must be obtained exclusively from process.env.API_KEY.
// Ensure this environment variable is set during your build/deployment process.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please ensure the API_KEY environment variable is correctly configured.");
  // In a real application, you might throw an error here or disable API-dependent features.
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY_FALLBACK" }); // Fallback for type safety, but !API_KEY handles runtime.

const safeGenerateContent = async (
  modelName: string,
  prompt: string | Part | Part[], // Accepts string, single Part, or array of Parts
  isJsonOutput: boolean = false
): Promise<string> => {
  if (!API_KEY) {
    return Promise.reject("API Key not configured. Please set the API_KEY environment variable.");
  }
  try {
    const model = ai.models;

    let requestContents: string | Content;
    if (typeof prompt === 'string') {
      requestContents = prompt;
    } else if (Array.isArray(prompt)) { // prompt is Part[]
      requestContents = { parts: prompt };
    } else { // prompt is a single Part
      requestContents = { parts: [prompt] };
    }
    
    const result: GenerateContentResponse = await model.generateContent({
        model: modelName,
        contents: requestContents,
        config: isJsonOutput ? { responseMimeType: "application/json" } : {},
    });
    
    let text = result.text;

    if (isJsonOutput && text) {
      text = text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = text.match(fenceRegex);
      if (match && match[2]) {
        text = match[2].trim();
      }
    }
    return text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        return Promise.reject(`Gemini API Error: ${error.message}`);
    }
    return Promise.reject("Gemini API Error: An unknown error occurred.");
  }
};


export const GeminiService = {
  summarizeText: async (textToSummarize: string): Promise<string> => {
    const prompt = `Summarize the following document:\n\n${textToSummarize}`;
    return safeGenerateContent(GEMINI_TEXT_MODEL, prompt);
  },

  answerQuestionAboutText: async (documentText: string, question: string): Promise<string> => {
    const prompt = `Based on the following document:\n\n${documentText}\n\nAnswer this question: ${question}`;
    return safeGenerateContent(GEMINI_TEXT_MODEL, prompt);
  },

  updateChecklistWithRegulations: async (existingChecklist: string, regulationSummary: string): Promise<string> => {
    const prompt = `Given the following new safety regulation summary:\n\n${regulationSummary}\n\nAnd this existing safety checklist:\n\n${existingChecklist}\n\nUpdate the checklist to be compliant with the new regulations. Clearly indicate changes or additions. Output only the updated checklist text.`;
    return safeGenerateContent(GEMINI_TEXT_MODEL, prompt);
  },

  analyzeImageForSafety: async (base64Image: string, mimeType: string, customPrompt: string): Promise<string> => {
    const imagePart: Part = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };
    const textPart: Part = {
      text: customPrompt || "Describe this image focusing on potential safety hazards. Identify any unsafe acts or conditions, particularly concerning work near high voltage equipment if visible.",
    };
    // Pass as an array of Parts
    return safeGenerateContent(GEMINI_IMAGE_MODEL, [imagePart, textPart]);
  },

  generateSafetyReport: async (checklist: string, notes: string, scopeOfWorkSummary: string, imageAnalyses: string[]): Promise<string> => {
    const prompt = `
      Create a safety violations report based on the following information:
      
      Updated Safety Checklist:
      ${checklist}
      
      Inspector's Notes (including image analysis):
      ${notes}
      ${imageAnalyses.map(imgAna => `\nImage Analysis: ${imgAna}`).join('')}
      
      Contractor's Scope of Work Summary:
      ${scopeOfWorkSummary}
      
      Please summarize key safety violations, categorize them if possible, and provide a draft report.
      Format the report clearly with sections for different findings.
    `;
    return safeGenerateContent(GEMINI_TEXT_MODEL, prompt);
  },

  draftUrgentEmail: async (violationsSummary: string, recipientName: string = "Head of H&S"): Promise<string> => {
    const prompt = `
      Draft an urgent email to the ${recipientName} regarding severe safety violations found during a worksite inspection.
      The email should be formal, concise, and clearly state the urgency.
      Include the following bullet points summarizing the violations:
      ${violationsSummary}
      
      Suggest immediate actions if appropriate.
    `;
    return safeGenerateContent(GEMINI_TEXT_MODEL, prompt);
  },

  summarizeDocumentWithFocus: async (documentText: string, focusPrompt: string): Promise<string> => {
    const prompt = `${focusPrompt}\n\nDocument content:\n${documentText}`;
    return safeGenerateContent(GEMINI_TEXT_MODEL, prompt);
  },
};
