import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, NDTStandard } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getStandardsFromBackend() {
  try {
    const response = await fetch("/api/standards");
    if (!response.ok) throw new Error("Failed to fetch standards");
    return await response.json();
  } catch (error) {
    console.error("Error fetching standards from backend:", error);
    return null;
  }
}

export async function analyzeRTFilm(
  base64Image: string,
  config: {
    thickness: string;
    qualityLevel: string;
    structureType?: string;
    standardUsed?: string;
    feedbackContext?: string;
  }
): Promise<AnalysisResult> {
  const backendStandards = await getStandardsFromBackend();
  
  const SYSTEM_INSTRUCTION = `You are an expert NDT (Non-Destructive Testing) and Radiographic Testing (RT) specialist for MARINA (Maritime Regulatory Inspection and NDT Assessment). 
Your task is to analyze RT film images of welds and interpret defects based on maritime and international standards.

USER CONFIGURATION:
- Material Thickness: ${config.thickness} mm
- Quality Level: ${config.qualityLevel}
- Structure Type: ${config.structureType || "Not Specified"}
- Selected Standard: ${config.standardUsed || "ISO 17636-1"}
- Analysis Mode: Maritime NDT Assessment

${config.feedbackContext ? `HISTORICAL FEEDBACK (USE THIS TO REFINE ANALYSIS):
${config.feedbackContext}` : ""}

BACKEND STANDARDS KNOWLEDGE:
${JSON.stringify(backendStandards, null, 2)}

PRIMARY CONSIDERATION:
- ${config.standardUsed || "ISO 17636-1"}: This is the primary standard for detection and image quality.
- Focus on weld defect identification and characterization as per maritime standards.
- Use the provided Material Thickness and Quality Level to determine acceptance criteria.
- NEVER provide percentage assurance or confidence scores in the result.

ANALYSIS REQUIREMENTS:
- Identify the type of defect (e.g., Porosity, Slag Inclusion, Lack of Fusion, Cracks, Undercut).
- Estimate the size of each defect.
- Identify the location (e.g., Root, Face, Heat Affected Zone).
- Describe the distribution (e.g., Isolated, Scattered, Cluster, Linear).
- Provide normalized bounding box coordinates [ymin, xmin, ymax, xmax] for each defect, where 0-1000 represents the full image dimensions.
- Determine a Compliance Grade: "Acceptable", "Repair Required", or "Reject" based on the collective criteria of the standards.

OUTPUT FORMAT:
Return your analysis in a structured JSON format matching the AnalysisResult interface.
Include a summary of the findings and specific recommendations for repair or acceptance.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: `Analyze this RT film for a ${config.structureType || "maritime structure"} using ${config.standardUsed || "ISO 17636-1"}. Thickness is ${config.thickness}mm and target quality level is ${config.qualityLevel}. 
        Reference standards and data from: https://drive.google.com/drive/folders/1M_5GzkckXbEGgkzJgNBQqAtmB1oYkLDu` },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1],
          },
        },
      ],
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ urlContext: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          defects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                size: { type: Type.STRING },
                location: { type: Type.STRING },
                distribution: { type: Type.STRING },
                description: { type: Type.STRING },
                boundingBox: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  description: "[ymin, xmin, ymax, xmax] normalized 0-1000"
                },
              },
              required: ["type", "size", "location", "distribution", "description", "boundingBox"],
            },
          },
          complianceGrade: { 
            type: Type.STRING,
            enum: ["Acceptable", "Repair Required", "Reject"]
          },
          standardApplied: { 
            type: Type.STRING,
            description: "The primary standard used for analysis: ISO_17636_1, ISO_17636_2, ASME_SECTION_V, ASTM_E94, or DNV_OS_C401"
          },
          summary: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["defects", "complianceGrade", "standardApplied", "summary", "recommendations"],
      },
    },
  });

  const result = JSON.parse(response.text || "{}");
  return result as AnalysisResult;
}
