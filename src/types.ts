export type NDTStandard = 
  | "ASME_VIII" 
  | "AWS_D1_1" 
  | "DNV_ST_N001" 
  | "DNV_ST_N002" 
  | "ISO_17636_1";

export interface RTDefect {
  type: string;
  size: string;
  location: string;
  distribution: string;
  description: string;
  shape?: string;
  confidence?: string;
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
