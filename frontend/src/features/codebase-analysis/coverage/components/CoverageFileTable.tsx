import { useState, useMemo } from 'react';
import { FileCoverage } from '../utils/coverageTypes';
import { getRiskColorFromPercentage } from '../utils/coverageThresholds';
import { getFileName, getRelativePath } from '../utils/pathUtils';
import styles from './CoverageFileTable.module.css';

interface CoverageFileTableProps {
  files: FileCoverage[];
}

type SortField = 'path' | 'statements' | 'branches' | 'functions' | 'lines';
type SortDirection = 'asc' | 'desc';

export function CoverageFileTable({ files }: CoverageFileTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('statements');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter files by search term
  const filteredFiles = useMemo(() => {
    if (!searchTerm) return files;
    const term = searchTerm.toLowerCase();
    return files.filter((file) => file.path.toLowerCase().includes(term));
  }, [files, searchTerm]);

  // Sort files
  const sortedFiles = useMemo(() => {
    const sorted = [...filteredFiles].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      if (sortField === 'path') {
        aValue = a.path;
        bValue = b.path;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  }, [filteredFiles, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (files.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No files found in coverage report</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Filter by file path..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.resultCount}>
          {filteredFiles.length} of {files.length} files
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('path')} className={styles.sortable}>
                File Path {getSortIcon('path')}
              </th>
              <th onClick={() => handleSort('statements')} className={styles.sortable}>
                Statements {getSortIcon('statements')}
              </th>
              <th onClick={() => handleSort('branches')} className={styles.sortable}>
                Branches {getSortIcon('branches')}
              </th>
              <th onClick={() => handleSort('functions')} className={styles.sortable}>
                Functions {getSortIcon('functions')}
              </th>
              <th onClick={() => handleSort('lines')} className={styles.sortable}>
                Lines {getSortIcon('lines')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedFiles.map((file) => {
              const avgCoverage =
                (file.statements + file.branches + file.functions + file.lines) / 4;
              const riskColor = getRiskColorFromPercentage(avgCoverage);
              const fileName = getFileName(file.path);
              const relativePath = getRelativePath(file.path);

              return (
                <tr key={file.path} className={styles.row}>
                  <td className={styles.pathCell} title={relativePath}>
                    {fileName}
                  </td>
                  <td style={{ color: getRiskColorFromPercentage(file.statements) }}>
                    {file.statements.toFixed(1)}%
                  </td>
                  <td style={{ color: getRiskColorFromPercentage(file.branches) }}>
                    {file.branches.toFixed(1)}%
                  </td>
                  <td style={{ color: getRiskColorFromPercentage(file.functions) }}>
                    {file.functions.toFixed(1)}%
                  </td>
                  <td style={{ color: getRiskColorFromPercentage(file.lines) }}>
                    {file.lines.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredFiles.length === 0 && searchTerm && (
        <div className={styles.noResults}>
          <p>No files match "{searchTerm}"</p>
          <button onClick={() => setSearchTerm('')} className={styles.clearButton}>
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
