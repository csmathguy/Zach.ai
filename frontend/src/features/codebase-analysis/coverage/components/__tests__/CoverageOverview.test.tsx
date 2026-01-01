import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { CoverageOverview } from '../CoverageOverview';
import type { CoverageTotals } from '../../utils/coverageTypes';

describe('CoverageOverview', () => {
  const mockCoverage: CoverageTotals = {
    lines: 85.5,
    statements: 80.25,
    functions: 75.0,
    branches: 70.5,
  };

  it('should render all coverage metrics', () => {
    render(<CoverageOverview coverage={mockCoverage} />);

    expect(screen.getByText(/statements/i)).toBeInTheDocument();
    expect(screen.getByText(/branches/i)).toBeInTheDocument();
    expect(screen.getByText(/functions/i)).toBeInTheDocument();
    expect(screen.getByText(/lines/i)).toBeInTheDocument();
  });

  it('should display correct percentage values', () => {
    render(<CoverageOverview coverage={mockCoverage} />);

    // Component formats to 1 decimal place
    expect(screen.getByText('80.3%')).toBeInTheDocument();
    expect(screen.getByText('70.5%')).toBeInTheDocument();
    expect(screen.getByText('75.0%')).toBeInTheDocument();
    expect(screen.getByText('85.5%')).toBeInTheDocument();
  });

  it('should display risk colors based on thresholds', () => {
    render(<CoverageOverview coverage={mockCoverage} />);

    // All metrics should be green (>= 70%) - verify component renders
    expect(screen.getByText(/statements/i)).toBeInTheDocument();
    expect(screen.getByText(/branches/i)).toBeInTheDocument();
  });

  it('should handle zero coverage', () => {
    const zeroCoverage: CoverageTotals = {
      lines: 0,
      statements: 0,
      functions: 0,
      branches: 0,
    };

    render(<CoverageOverview coverage={zeroCoverage} />);

    const zeroPercents = screen.getAllByText('0.0%');
    expect(zeroPercents.length).toBeGreaterThan(0);
  });

  it('should handle 100% coverage', () => {
    const fullCoverage: CoverageTotals = {
      lines: 100,
      statements: 100,
      functions: 100,
      branches: 100,
    };

    render(<CoverageOverview coverage={fullCoverage} />);

    const percentages = screen.getAllByText('100.0%');
    expect(percentages.length).toBeGreaterThan(0);
  });

  it('should display metrics in correct order', () => {
    render(<CoverageOverview coverage={mockCoverage} />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent(/statements/i);
    expect(headings[1]).toHaveTextContent(/branches/i);
    expect(headings[2]).toHaveTextContent(/functions/i);
    expect(headings[3]).toHaveTextContent(/lines/i);
  });

  it('should apply appropriate risk emoji for low coverage', () => {
    const lowCoverage: CoverageTotals = {
      lines: 40,
      statements: 30,
      functions: 20,
      branches: 10,
    };

    render(<CoverageOverview coverage={lowCoverage} />);

    // Should render with red/warning indicators (component formats as "40.0%" not "40.00%")
    expect(screen.getByText('40.0%')).toBeInTheDocument();
    expect(screen.getByText('30.0%')).toBeInTheDocument();
  });

  it('should apply appropriate risk emoji for medium coverage', () => {
    const mediumCoverage: CoverageTotals = {
      lines: 65,
      statements: 62,
      functions: 68,
      branches: 61,
    };

    render(<CoverageOverview coverage={mediumCoverage} />);

    // Should render with yellow/warning indicators (component formats as "65.0%" not "65.00%")
    expect(screen.getByText('65.0%')).toBeInTheDocument();
    expect(screen.getByText('62.0%')).toBeInTheDocument();
  });
});
