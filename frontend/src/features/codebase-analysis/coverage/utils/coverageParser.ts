import type { CoverageSummary, ParsedCoverageData, FileCoverage } from './coverageTypes';

/**
 * Parse Jest coverage-summary.json into a more usable format
 */
export function parseCoverageData(data: CoverageSummary): ParsedCoverageData {
  const { total, ...fileEntries } = data;

  const files: FileCoverage[] = Object.entries(fileEntries).map(([path, metrics]) => ({
    path,
    statements: metrics.statements.pct,
    branches: metrics.branches.pct,
    functions: metrics.functions.pct,
    lines: metrics.lines.pct,
  }));

  return {
    total: {
      statements: total.statements.pct,
      branches: total.branches.pct,
      functions: total.functions.pct,
      lines: total.lines.pct,
    },
    files,
  };
}

/**
 * Format coverage percentage for display
 */
export function formatPercentage(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

/**
 * Format file path for display (remove leading slashes, shorten if needed)
 */
export function formatFilePath(path: string, maxLength = 60): string {
  let formatted = path.replace(/^[/\\]+/, '');

  if (formatted.length > maxLength) {
    const parts = formatted.split(/[/\\]/);
    if (parts.length > 2) {
      return `.../${parts.slice(-2).join('/')}`;
    }
  }

  return formatted;
}
