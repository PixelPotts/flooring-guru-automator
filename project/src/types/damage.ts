export interface DamageAnalysis {
  severity: number;  // 0-1 scale
  issues: string[];  // List of detected issues
  recommendations: string[];  // List of recommended actions
  costs: Array<{
    item: string;
    amount: number;
  }>;
}

export interface DamageLocation {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  type: string;
}

export interface DamageReport {
  id: string;
  date: string;
  imageUrl: string;
  analysis: DamageAnalysis;
  locations?: DamageLocation[];
  notes?: string;
}