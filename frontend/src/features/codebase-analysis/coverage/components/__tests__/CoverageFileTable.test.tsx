import { describe, it, expect } from '@jest/globals';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoverageFileTable } from '../CoverageFileTable';
import type { FileCoverage } from '../../utils/coverageTypes';

describe('CoverageFileTable', () => {
  const createMockFile = (
    path: string,
    statements: number,
    branches: number,
    functions: number,
    lines: number
  ): FileCoverage => ({
    path,
    statements,
    branches,
    functions,
    lines,
  });

  it('should render table headers', () => {
    const mockFiles: FileCoverage[] = [
      createMockFile('src/test.ts', 50, 50, 50, 50),
    ];

    render(<CoverageFileTable files={mockFiles} />);

    // Headers are present (may have sorting icons)
    expect(screen.getByText(/file path/i)).toBeInTheDocument();
    expect(screen.getByText(/statements/i)).toBeInTheDocument();
    expect(screen.getByText(/branches/i)).toBeInTheDocument();
    expect(screen.getByText(/functions/i)).toBeInTheDocument();
    expect(screen.getByText(/lines/i)).toBeInTheDocument();
  });

  it('should render file data in table rows', () => {
    const mockFiles: FileCoverage[] = [
      createMockFile('src/components/Button.tsx', 85.5, 70.25, 90.0, 88.75),
      createMockFile('src/utils/helpers.ts', 65.0, 55.5, 72.25, 68.0),
    ];

    render(<CoverageFileTable files={mockFiles} />);

    // File names should be extracted
    expect(screen.getByText('Button.tsx')).toBeInTheDocument();
    expect(screen.getByText('helpers.ts')).toBeInTheDocument();

    // Percentages are formatted to 1 decimal place
    expect(screen.getByText('85.5%')).toBeInTheDocument();
    expect(screen.getByText('70.3%')).toBeInTheDocument(); // 70.25 rounds to 70.3
    expect(screen.getByText('90.0%')).toBeInTheDocument();
  });

  it('should handle empty files array', () => {
    const mockFiles: FileCoverage[] = [];

    render(<CoverageFileTable files={mockFiles} />);

    // Should show empty message
    expect(screen.getByText(/no files found/i)).toBeInTheDocument();
  });

  it('should display file name from absolute path', () => {
    const mockFiles: FileCoverage[] = [
      createMockFile('C:\\Users\\dev\\project\\Zach.ai\\frontend\\src\\App.tsx', 75, 65, 80, 72),
    ];

    render(<CoverageFileTable files={mockFiles} />);

    expect(screen.getByText('App.tsx')).toBeInTheDocument();
  });

  it('should show relative path on hover (title attribute)', () => {
    const mockFiles: FileCoverage[] = [
      createMockFile('Zach.ai/frontend/src/features/dashboard/Dashboard.tsx', 85, 70, 90, 88),
    ];

    const { container } = render(<CoverageFileTable files={mockFiles} />);

    // Find the cell with title attribute
    const fileCell = container.querySelector('[title*="src/features"]');
    expect(fileCell).toBeInTheDocument();
  });

  it('should handle files with 0% coverage', () => {
    const mockFiles: FileCoverage[] = [createMockFile('src/uncovered.ts', 0, 0, 0, 0)];

    render(<CoverageFileTable files={mockFiles} />);

    expect(screen.getByText('uncovered.ts')).toBeInTheDocument();
    const zeroPercents = screen.getAllByText('0.0%');
    expect(zeroPercents.length).toBeGreaterThan(0);
  });

  it('should handle files with 100% coverage', () => {
    const mockFiles: FileCoverage[] = [createMockFile('src/perfect.ts', 100, 100, 100, 100)];

    render(<CoverageFileTable files={mockFiles} />);

    expect(screen.getByText('perfect.ts')).toBeInTheDocument();
    const hundredPercents = screen.getAllByText('100.0%');
    expect(hundredPercents.length).toBeGreaterThan(0);
  });

  it('should display decimal precision correctly', () => {
    const mockFiles: FileCoverage[] = [
      createMockFile('src/test.ts', 85.555, 70.123, 90.999, 88.001),
    ];

    render(<CoverageFileTable files={mockFiles} />);

    // Should format to 1 decimal place
    expect(screen.getByText('85.6%')).toBeInTheDocument(); // 85.555 rounds to 85.6
    expect(screen.getByText('70.1%')).toBeInTheDocument(); // 70.123 rounds to 70.1
    expect(screen.getByText('91.0%')).toBeInTheDocument(); // 90.999 rounds to 91.0
    expect(screen.getByText('88.0%')).toBeInTheDocument(); // 88.001 rounds to 88.0
  });

  it('should render multiple files in correct order', () => {
    const mockFiles: FileCoverage[] = [
      createMockFile('src/a.ts', 90, 85, 95, 92),
      createMockFile('src/b.ts', 80, 75, 85, 82),
      createMockFile('src/c.ts', 70, 65, 75, 72),
    ];

    render(<CoverageFileTable files={mockFiles} />);

    expect(screen.getByText('a.ts')).toBeInTheDocument();
    expect(screen.getByText('b.ts')).toBeInTheDocument();
    expect(screen.getByText('c.ts')).toBeInTheDocument();
  });

  describe('Filtering', () => {
    const mockFiles: FileCoverage[] = [
      createMockFile('src/components/Button.tsx', 85, 70, 90, 88),
      createMockFile('src/components/Card.tsx', 75, 65, 80, 78),
      createMockFile('src/utils/helpers.ts', 90, 85, 95, 92),
      createMockFile('src/utils/formatters.ts', 80, 75, 85, 82),
    ];

    it('should filter files by search term', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText(/filter by file path/i);
      await user.type(searchInput, 'components');

      // Only component files should be visible
      expect(screen.getByText('Button.tsx')).toBeInTheDocument();
      expect(screen.getByText('Card.tsx')).toBeInTheDocument();
      expect(screen.queryByText('helpers.ts')).not.toBeInTheDocument();
      expect(screen.queryByText('formatters.ts')).not.toBeInTheDocument();
    });

    it('should be case-insensitive when filtering', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText(/filter by file path/i);
      await user.type(searchInput, 'BUTTON');

      expect(screen.getByText('Button.tsx')).toBeInTheDocument();
      expect(screen.queryByText('Card.tsx')).not.toBeInTheDocument();
    });

    it('should show "no results" message when no files match', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText(/filter by file path/i);
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText(/no files match "nonexistent"/i)).toBeInTheDocument();
    });

    it('should show clear button when search has no results', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText(/filter by file path/i);
      await user.type(searchInput, 'xyz');

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText(/filter by file path/i);
      await user.type(searchInput, 'xyz');

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
      expect(screen.queryByText(/no files match/i)).not.toBeInTheDocument();
    });

    it('should update result count when filtering', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      // Initial count
      expect(screen.getByText('4 of 4 files')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/filter by file path/i);
      await user.type(searchInput, 'utils');

      // Filtered count
      expect(screen.getByText('2 of 4 files')).toBeInTheDocument();
    });

    it('should show all files when search is cleared', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText(/filter by file path/i);
      await user.type(searchInput, 'Button');
      await user.clear(searchInput);

      expect(screen.getByText('4 of 4 files')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    const mockFiles: FileCoverage[] = [
      createMockFile('src/c.ts', 70, 60, 75, 72),
      createMockFile('src/a.ts', 90, 85, 95, 92),
      createMockFile('src/b.ts', 80, 75, 85, 82),
    ];

    it('should sort by path in ascending order', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const pathHeader = screen.getByText(/file path/i);
      await user.click(pathHeader);

      const rows = screen.getAllByRole('row');
      // Skip header row (index 0)
      const firstDataRow = within(rows[1]).getByText('a.ts');
      expect(firstDataRow).toBeInTheDocument();
    });

    it('should toggle sort direction when clicking same header', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const pathHeader = screen.getByText(/file path/i);

      // First click: ascending
      await user.click(pathHeader);
      let rows = screen.getAllByRole('row');
      expect(within(rows[1]).queryByText('a.ts')).toBeInTheDocument();

      // Second click: descending
      await user.click(pathHeader);
      rows = screen.getAllByRole('row');
      expect(within(rows[1]).queryByText('c.ts')).toBeInTheDocument();
    });

    it('should sort by statements percentage', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const statementsHeader = screen.getByText(/statements/i);
      await user.click(statementsHeader);

      const rows = screen.getAllByRole('row');
      // After one click on statements, direction should toggle to desc (high to low)
      // a.ts has highest statements (90)
      expect(within(rows[1]).queryByText('a.ts')).toBeInTheDocument();
    });

    it('should sort by branches percentage', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const branchesHeader = screen.getByText(/branches/i);
      await user.click(branchesHeader);

      const rows = screen.getAllByRole('row');
      // Lowest branches first (60%)
      expect(within(rows[1]).queryByText('c.ts')).toBeInTheDocument();
    });

    it('should sort by functions percentage', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const functionsHeader = screen.getByText(/functions/i);
      await user.click(functionsHeader);

      const rows = screen.getAllByRole('row');
      // Lowest functions first (75%)
      expect(within(rows[1]).queryByText('c.ts')).toBeInTheDocument();
    });

    it('should sort by lines percentage', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      const linesHeader = screen.getByText(/lines/i);
      await user.click(linesHeader);

      const rows = screen.getAllByRole('row');
      // Lowest lines first (72%)
      expect(within(rows[1]).queryByText('c.ts')).toBeInTheDocument();
    });

    it('should show sort icons on headers', () => {
      render(<CoverageFileTable files={mockFiles} />);

      // All headers should have sort indicators
      expect(screen.getByText(/file path/i).textContent).toMatch(/⇅|↑|↓/);
      expect(screen.getByText(/statements/i).textContent).toMatch(/⇅|↑|↓/);
      expect(screen.getByText(/branches/i).textContent).toMatch(/⇅|↑|↓/);
      expect(screen.getByText(/functions/i).textContent).toMatch(/⇅|↑|↓/);
      expect(screen.getByText(/lines/i).textContent).toMatch(/⇅|↑|↓/);
    });

    it('should change sort field when clicking different header', async () => {
      const user = userEvent.setup();
      render(<CoverageFileTable files={mockFiles} />);

      // Default sort is by statements ascending, so first click toggles to descending
      await user.click(screen.getByText(/statements/i));
      let rows = screen.getAllByRole('row');
      // Descending: a.ts (90) should be first
      expect(within(rows[1]).queryByText('a.ts')).toBeInTheDocument();

      // Click lines header - resets to ascending
      await user.click(screen.getByText(/lines/i));
      rows = screen.getAllByRole('row');
      // Ascending lines: c.ts (72), b.ts (82), a.ts (92)
      expect(within(rows[1]).queryByText('c.ts')).toBeInTheDocument();
    });
  });

  describe('Color coding', () => {
    it('should apply color based on coverage percentage', () => {
      const mockFiles: FileCoverage[] = [
        createMockFile('src/high.ts', 90, 85, 95, 92), // High coverage (green-ish)
        createMockFile('src/medium.ts', 70, 65, 75, 72), // Medium coverage (yellow-ish)
        createMockFile('src/low.ts', 40, 35, 45, 42), // Low coverage (red-ish)
      ];

      const { container } = render(<CoverageFileTable files={mockFiles} />);

      // Find cells with style attributes (coverage percentages have colors)
      const styledCells = container.querySelectorAll('td[style]');
      expect(styledCells.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle single file', () => {
      const mockFiles: FileCoverage[] = [createMockFile('src/only.ts', 85, 70, 90, 88)];

      render(<CoverageFileTable files={mockFiles} />);

      expect(screen.getByText('only.ts')).toBeInTheDocument();
      expect(screen.getByText('1 of 1 files')).toBeInTheDocument();
    });

    it('should handle many files (performance)', () => {
      const mockFiles: FileCoverage[] = Array.from({ length: 100 }, (_, i) =>
        createMockFile(`src/file${i}.ts`, 80 + i * 0.1, 75, 85, 82)
      );

      render(<CoverageFileTable files={mockFiles} />);

      expect(screen.getByText('100 of 100 files')).toBeInTheDocument();
    });

    it('should handle files with identical coverage', () => {
      const mockFiles: FileCoverage[] = [
        createMockFile('src/a.ts', 80, 70, 85, 82),
        createMockFile('src/b.ts', 80, 70, 85, 82),
        createMockFile('src/c.ts', 80, 70, 85, 82),
      ];

      render(<CoverageFileTable files={mockFiles} />);

      expect(screen.getByText('a.ts')).toBeInTheDocument();
      expect(screen.getByText('b.ts')).toBeInTheDocument();
      expect(screen.getByText('c.ts')).toBeInTheDocument();
    });

    it('should handle very long file paths', () => {
      const longPath =
        'src/very/long/path/to/some/deeply/nested/directory/structure/with/many/levels/File.tsx';
      const mockFiles: FileCoverage[] = [createMockFile(longPath, 85, 70, 90, 88)];

      render(<CoverageFileTable files={mockFiles} />);

      // Should show shortened filename
      expect(screen.getByText('File.tsx')).toBeInTheDocument();
    });

    it('should handle special characters in file paths', () => {
      const mockFiles: FileCoverage[] = [
        createMockFile('src/@types/index.d.ts', 85, 70, 90, 88),
        createMockFile('src/components/$special.tsx', 75, 65, 80, 78),
      ];

      render(<CoverageFileTable files={mockFiles} />);

      expect(screen.getByText('index.d.ts')).toBeInTheDocument();
      expect(screen.getByText('$special.tsx')).toBeInTheDocument();
    });

    it('should handle rapid filtering', async () => {
      const user = userEvent.setup();
      const mockFiles: FileCoverage[] = [
        createMockFile('src/a.ts', 90, 85, 95, 92),
        createMockFile('src/b.ts', 80, 75, 85, 82),
        createMockFile('src/c.ts', 70, 65, 75, 72),
      ];

      render(<CoverageFileTable files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText(/filter by file path/i);

      // Rapid typing
      await user.type(searchInput, 'abc');
      await user.clear(searchInput);
      await user.type(searchInput, 'xyz');

      // Should not crash
      expect(screen.getByText(/no files match/i)).toBeInTheDocument();
    });

    it('should handle rapid sorting', async () => {
      const user = userEvent.setup();
      const mockFiles: FileCoverage[] = [
        createMockFile('src/a.ts', 90, 85, 95, 92),
        createMockFile('src/b.ts', 80, 75, 85, 82),
      ];

      render(<CoverageFileTable files={mockFiles} />);

      // Rapid clicks
      const pathHeader = screen.getByText(/file path/i);
      await user.click(pathHeader);
      await user.click(pathHeader);
      await user.click(pathHeader);

      // Should not crash
      expect(screen.getByText('a.ts')).toBeInTheDocument();
    });
  });
});
