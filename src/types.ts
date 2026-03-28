export type NDTStandard = 
  | "ISO_17636_1" 
  | "ISO_17636_2" 
  | "ASME_SECTION_V" 
  | "ASTM_E94" 
  | "DNV_OS_C401";

export interface RTDefect {
  type: string;
  size: string;
  location: string;
  distribution: string;
  description: string;
  shape?: string;
  isoLimit?: string;
  status?: "Accept" | "Reject" | "Review";
  boundingBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
}

export interface AnalysisResult {
  defects: RTDefect[];
  complianceGrade: "Acceptable" | "Repair Required" | "Reject";
  standardApplied: NDTStandard;
  summary: string;
  recommendations: string[];
  totalIndications?: number;
  defectCounts?: {
    porosity: number;
    slagInclusion: number;
    lackOfFusion: number;
    crack: number;
  };
  criticalDefectsFound?: string[];
  remarks?: string[];
}

export interface StandardReference {
  id: NDTStandard;
  name: string;
  description: string;
  keyCriteria: string[];
}
