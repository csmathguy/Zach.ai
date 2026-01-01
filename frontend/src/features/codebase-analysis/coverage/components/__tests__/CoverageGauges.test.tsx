import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { CoverageGauges } from '../CoverageGauges';
import type { CoverageTotals } from '../../utils/coverageTypes';

describe('CoverageGauges', () => {
  it('should render all four gauge charts', () => {
    const mockCoverage: CoverageTotals = {
      statements: 75.5,
      branches: 68.3,
      functions: 82.1,
      lines: 77.9,
    };

    render(<CoverageGauges coverage={mockCoverage} />);

    expect(screen.getByText('Statements')).toBeInTheDocument();
    expect(screen.getByText('Branches')).toBeInTheDocument();
    expect(screen.getByText('Functions')).toBeInTheDocument();
    expect(screen.getByText('Lines')).toBeInTheDocument();
  });

  it('should render with high coverage values', () => {
    const mockCoverage: CoverageTotals = {
      statements: 95.0,
      branches: 92.0,
      functions: 98.0,
      lines: 96.0,
    };

    render(<CoverageGauges coverage={mockCoverage} />);

    expect(screen.getByText('Statements')).toBeInTheDocument();
    expect(screen.getByText('Branches')).toBeInTheDocument();
    expect(screen.getByText('Functions')).toBeInTheDocument();
    expect(screen.getByText('Lines')).toBeInTheDocument();
  });

  it('should render with low coverage values', () => {
    const mockCoverage: CoverageTotals = {
      statements: 25.0,
      branches: 30.0,
      functions: 20.0,
      lines: 28.0,
    };

    render(<CoverageGauges coverage={mockCoverage} />);

    expect(screen.getByText('Statements')).toBeInTheDocument();
    expect(screen.getByText('Branches')).toBeInTheDocument();
    expect(screen.getByText('Functions')).toBeInTheDocument();
    expect(screen.getByText('Lines')).toBeInTheDocument();
  });

  it('should render with zero coverage', () => {
    const mockCoverage: CoverageTotals = {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    };

    render(<CoverageGauges coverage={mockCoverage} />);

    expect(screen.getByText('Statements')).toBeInTheDocument();
    expect(screen.getByText('Branches')).toBeInTheDocument();
    expect(screen.getByText('Functions')).toBeInTheDocument();
    expect(screen.getByText('Lines')).toBeInTheDocument();
  });

  it('should render with 100% coverage', () => {
    const mockCoverage: CoverageTotals = {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    };

    render(<CoverageGauges coverage={mockCoverage} />);

    expect(screen.getByText('Statements')).toBeInTheDocument();
    expect(screen.getByText('Branches')).toBeInTheDocument();
    expect(screen.getByText('Functions')).toBeInTheDocument();
    expect(screen.getByText('Lines')).toBeInTheDocument();
  });
});
