// Jest coverage JSON types
export interface CoverageMetrics {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

export interface FileCoverageRaw {
  lines: CoverageMetrics;
  statements: CoverageMetrics;
  functions: CoverageMetrics;
  branches: CoverageMetrics;
}

export interface CoverageSummary {
  total: FileCoverageRaw;
  [filePath: string]: FileCoverageRaw;
}

// Parsed types for components (percentage numbers)
export interface FileCoverage {
  path: string;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface CoverageTotals {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface ParsedCoverageData {
  total: CoverageTotals;
  files: FileCoverage[];
}

export type RiskLevel = 'high' | 'medium' | 'low';

export interface CoverageWithRisk extends CoverageTotals {
  riskLevel: RiskLevel;
}
