import type { RiskLevel, CoverageTotals } from './coverageTypes';

/**
 * Calculate risk level from percentage
 * Green >80%, Yellow 60-80%, Red <60%
 */
export function calculateRiskLevelFromPercentage(percentage: number): RiskLevel {
  if (percentage >= 80) return 'high';
  if (percentage >= 60) return 'medium';
  return 'low';
}

/**
 * Determine risk level based on average coverage percentage
 * Green >80%, Yellow 60-80%, Red <60%
 */
export function calculateRiskLevel(metrics: CoverageTotals): RiskLevel {
  const avgCoverage =
    (metrics.statements + metrics.branches + metrics.functions + metrics.lines) / 4;
  return calculateRiskLevelFromPercentage(avgCoverage);
}

/**
 * Get color for percentage value
 */
export function getRiskColorFromPercentage(percentage: number): string {
  const level = calculateRiskLevelFromPercentage(percentage);
  return getRiskColor(level);
}

/**
 * Get color for risk level
 */
export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return '#27ae60'; // Green
    case 'medium':
      return '#f39c12'; // Yellow/Orange
    case 'low':
      return '#e74c3c'; // Red
  }
}

/**
 * Get emoji indicator for risk level
 */
export function getRiskEmoji(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return '✅';
    case 'medium':
      return '⚠️';
    case 'low':
      return '❌';
  }
}

/**
 * Get label for risk level
 */
export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return 'Good Coverage';
    case 'medium':
      return 'Needs Attention';
    case 'low':
      return 'Critical';
  }
}
