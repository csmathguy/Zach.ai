import type { CoverageTotals } from '../utils/coverageTypes';
import { getRiskColorFromPercentage } from '../utils/coverageThresholds';
import styles from './CoverageGauges.module.css';

interface CoverageGaugesProps {
  coverage: CoverageTotals;
}

export function CoverageGauges({ coverage }: CoverageGaugesProps) {
  const gaugeData = [
    {
      name: 'Statements',
      value: coverage.statements,
      fill: getRiskColorFromPercentage(coverage.statements),
      icon: '📝',
    },
    {
      name: 'Branches',
      value: coverage.branches,
      fill: getRiskColorFromPercentage(coverage.branches),
      icon: '🔀',
    },
    {
      name: 'Functions',
      value: coverage.functions,
      fill: getRiskColorFromPercentage(coverage.functions),
      icon: '⚡',
    },
    {
      name: 'Lines',
      value: coverage.lines,
      fill: getRiskColorFromPercentage(coverage.lines),
      icon: '📏',
    },
  ];

  return (
    <div className={styles.gaugeGrid}>
      {gaugeData.map((metric) => (
        <div key={metric.name} className={styles.gaugeCard}>
          <div className={styles.gaugeHeader}>
            <span className={styles.icon}>{metric.icon}</span>
            <h4>{metric.name}</h4>
          </div>
          <div className={styles.percentageDisplay} style={{ color: metric.fill }}>
            {metric.value.toFixed(1)}%
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${metric.value}%`,
                backgroundColor: metric.fill,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
